import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import collectionsData from "./collections.seed.json";
import productsData from "./products.seed.json";
import galleryData from "./gallery.seed.json";

const prisma = new PrismaClient();

const CATEGORY_ENUM: Record<string, string> = {
  Batik: "Batik",
  "Songket and Tenun": "SongketTenun",
  Kebaya: "Kebaya",
  "Accessories and Jewelry": "AccessoriesJewelry",
  Bag: "Bag",
  Jewelry: "Jewelry",
  Plate: "Plate",
  "Other Accessories": "OtherAccessories",
};

function toCategoryEnum(category: string) {
  return CATEGORY_ENUM[category] ?? category;
}

async function main() {
  console.log("Seeding collections...");
  const slugToId: Record<string, string> = {};

  for (const c of collectionsData as any[]) {
    const created = await prisma.collection.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        image: c.image,
      },
      create: {
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        image: c.image,
      },
    });
    slugToId[c.slug] = created.id;
  }

  // Second pass: wire up parent/child relationships now that every
  // collection has been created, so a sub-collection's parentSlug
  // resolves correctly regardless of ordering in the seed file.
  for (const c of collectionsData as any[]) {
    if (!c.parentSlug) continue;
    const parentId = slugToId[c.parentSlug];
    if (!parentId) {
      console.warn(`Skipping parent link for ${c.slug}: unknown parent ${c.parentSlug}`);
      continue;
    }
    await prisma.collection.update({
      where: { slug: c.slug },
      data: { parentId },
    });
  }

  console.log("Seeding products...");
  for (const p of productsData as any[]) {
    const collectionIds = (p.collections as string[])
      .map((slug) => slugToId[slug])
      .filter((id): id is string => Boolean(id));

    if (collectionIds.length === 0) {
      console.warn(`Skipping product ${p.slug}: no known collections found`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        code: p.code,
        name: p.name,
        price: p.price,
        shortDescription: p.shortDescription,
        description: p.description,
        featured: !!p.featured,
      },
      create: {
        code: p.code,
        slug: p.slug,
        name: p.name,
        price: p.price,
        shortDescription: p.shortDescription,
        description: p.description,
        featured: !!p.featured,
      },
    });

    // reset relations so re-seeding is idempotent
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.specification.deleteMany({ where: { productId: product.id } });
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    await prisma.productCollection.deleteMany({ where: { productId: product.id } });

    if (Array.isArray(p.images)) {
      await prisma.productImage.createMany({
        data: p.images.map((url: string, idx: number) => ({
          url,
          order: idx,
          productId: product.id,
        })),
      });
    }

    if (Array.isArray(p.specifications)) {
      await prisma.specification.createMany({
        data: p.specifications.map((s: { label: string; value: string }, idx: number) => ({
          label: s.label,
          value: s.value,
          order: idx,
          productId: product.id,
        })),
      });
    }

    await prisma.productCategory.createMany({
      data: (p.categories as string[]).map((c) => ({
        category: toCategoryEnum(c) as any,
        productId: product.id,
      })),
    });

    await prisma.productCollection.createMany({
      data: collectionIds.map((collectionId) => ({ collectionId, productId: product.id })),
    });
  }

  console.log("Seeding gallery items...");
  for (const g of galleryData as any[]) {
    await prisma.galleryItem.upsert({
      where: { slug: g.slug },
      update: {
        title: g.title,
        description: g.description,
        date: g.date,
        image: g.image,
        tag: g.tag,
      },
      create: {
        slug: g.slug,
        title: g.title,
        description: g.description,
        date: g.date,
        image: g.image,
        tag: g.tag,
      },
    });
  }

  console.log("Seeding demo admin user...");
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@rizalheritage.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@rizalheritage.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
