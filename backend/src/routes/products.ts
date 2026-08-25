import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const categoryMap: Record<string, string> = {
  Batik: "Batik",
  "Songket and Tenun": "SongketTenun",
  Kebaya: "Kebaya",
  "Accessories and Jewelry": "AccessoriesJewelry",
  Bag: "Bag",
  Jewelry: "Jewelry",
  Plate: "Plate",
  "Other Accessories": "OtherAccessories",
};

const CATEGORY_VALUES = Object.keys(categoryMap) as [string, ...string[]];

const productInclude = {
  images: { orderBy: { order: "asc" as const } },
  categories: true,
  collections: { include: { collection: true } },
};

function serializeProduct<
  T extends {
    categories: { category: string }[];
    collections: { collection: { id: string; slug: string; name: string } }[];
  }
>(product: T) {
  const { categories, collections, ...rest } = product;
  return {
    ...rest,
    categories: categories.map((c) => c.category),
    collections: collections.map((c) => ({ slug: c.collection.slug, name: c.collection.name })),
  };
}

// GET /api/products?search=&category=&collection=&featured=&page=&pageSize=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, category, collection, featured, page = "1", pageSize = "12" } = req.query as Record<
      string,
      string
    >;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { code: { contains: search } },
      ];
    }
    if (category && categoryMap[category]) {
      where.categories = { some: { category: categoryMap[category] as any } };
    }
    if (collection) {
      where.collections = { some: { collection: { slug: collection } } };
    }
    if (featured === "true") {
      where.featured = true;
    }

    const take = Math.min(parseInt(pageSize, 10) || 12, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * take;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      items: items.map(serializeProduct),
      pagination: {
        page: currentPage,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { ...productInclude, specifications: { orderBy: { order: "asc" } } },
    });
    if (!product) throw new ApiError(404, "Product not found");
    res.json(serializeProduct(product));
  })
);

router.get(
  "/:slug/related",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { categories: true, collections: true },
    });
    if (!product) throw new ApiError(404, "Product not found");

    const categoryValues = product.categories.map((c) => c.category);
    const collectionIds = product.collections.map((c) => c.collectionId);

    const related = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        OR: [
          ...(collectionIds.length ? [{ collections: { some: { collectionId: { in: collectionIds } } } }] : []),
          ...(categoryValues.length ? [{ categories: { some: { category: { in: categoryValues } } } }] : []),
        ],
      },
      include: productInclude,
      take: 4,
    });
    res.json(related.map(serializeProduct));
  })
);

const specSchema = z.object({ label: z.string().min(1), value: z.string().min(1) });

const productSchema = z.object({
  code: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  // null = "no price" (display/inquiry-only listing)
  price: z.number().int().nonnegative().nullable(),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  collectionSlugs: z.array(z.string().min(1)).min(1),
  categories: z.array(z.enum(CATEGORY_VALUES)).min(1),
  images: z.array(z.string().url()).min(1),
  videoUrl: z.string().url().nullable().optional(),
  specifications: z.array(specSchema).default([]),
  featured: z.boolean().optional(),
  available: z.boolean().optional(),
});

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const data = parsed.data;

    const collections = await prisma.collection.findMany({
      where: { slug: { in: data.collectionSlugs } },
    });
    if (collections.length !== data.collectionSlugs.length) {
      throw new ApiError(400, "One or more collections were not found");
    }

    const product = await prisma.product.create({
      data: {
        code: data.code,
        slug: data.slug,
        name: data.name,
        price: data.price,
        shortDescription: data.shortDescription,
        description: data.description,
        featured: data.featured ?? false,
        available: data.available ?? true,
        videoUrl: data.videoUrl ?? null,
        images: { create: data.images.map((url, idx) => ({ url, order: idx })) },
        specifications: {
          create: data.specifications.map((s, idx) => ({ label: s.label, value: s.value, order: idx })),
        },
        categories: { create: data.categories.map((c) => ({ category: categoryMap[c] as any })) },
        collections: { create: collections.map((c) => ({ collectionId: c.id })) },
      },
      include: productInclude,
    });

    res.status(201).json(serializeProduct(product));
  })
);

router.put(
  "/:slug",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const data = parsed.data;

    const existing = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!existing) throw new ApiError(404, "Product not found");

    let collections: { id: string }[] | undefined;
    if (data.collectionSlugs) {
      collections = await prisma.collection.findMany({ where: { slug: { in: data.collectionSlugs } } });
      if (collections.length !== data.collectionSlugs.length) {
        throw new ApiError(400, "One or more collections were not found");
      }
    }

    if (data.images) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
    }
    if (data.specifications) {
      await prisma.specification.deleteMany({ where: { productId: existing.id } });
    }
    if (data.categories) {
      await prisma.productCategory.deleteMany({ where: { productId: existing.id } });
    }
    if (collections) {
      await prisma.productCollection.deleteMany({ where: { productId: existing.id } });
    }

    const updated = await prisma.product.update({
      where: { slug: req.params.slug },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.slug && { slug: data.slug }),
        ...(data.name && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.shortDescription && { shortDescription: data.shortDescription }),
        ...(data.description && { description: data.description }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.available !== undefined && { available: data.available }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.images && {
          images: { create: data.images.map((url, idx) => ({ url, order: idx })) },
        }),
        ...(data.specifications && {
          specifications: {
            create: data.specifications.map((s, idx) => ({ label: s.label, value: s.value, order: idx })),
          },
        }),
        ...(data.categories && {
          categories: { create: data.categories.map((c) => ({ category: categoryMap[c] as any })) },
        }),
        ...(collections && {
          collections: { create: collections.map((c) => ({ collectionId: c.id })) },
        }),
      },
      include: productInclude,
    });

    res.json(serializeProduct(updated));
  })
);

router.delete(
  "/:slug",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { slug: req.params.slug } });
    res.status(204).send();
  })
);

export default router;
