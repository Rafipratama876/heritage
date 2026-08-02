import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const childSelect = { slug: true, name: true, tagline: true, image: true };

// GET /api/collections — top-level collections only (parentId is null)
// by default, each including its direct children for display (e.g. as
// chips under "Songket and Tenun" on the collections index page).
// Pass ?all=true to get every collection flat, including
// sub-collections — used by the admin panel's pickers/lists.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const all = req.query.all === "true";
    const collections = await prisma.collection.findMany({
      where: all ? {} : { parentId: null },
      include: { children: { select: childSelect, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(collections);
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const collection = await prisma.collection.findUnique({
      where: { slug: req.params.slug },
      include: {
        parent: { select: childSelect },
        children: { select: childSelect, orderBy: { createdAt: "asc" } },
        products: {
          include: {
            product: {
              include: {
                images: { orderBy: { order: "asc" } },
                categories: true,
                collections: { include: { collection: true } },
              },
            },
          },
        },
      },
    });
    if (!collection) throw new ApiError(404, "Collection not found");

    const { products, ...rest } = collection;
    res.json({
      ...rest,
      products: products.map(({ product }) => {
        const { categories, collections, ...productRest } = product;
        return {
          ...productRest,
          categories: categories.map((c) => c.category),
          collections: collections.map((c) => ({ slug: c.collection.slug, name: c.collection.name })),
        };
      }),
    });
  })
);

const collectionSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  parentSlug: z.string().nullable().optional(),
});

async function resolveParentId(parentSlug: string | null | undefined, selfSlug?: string) {
  if (parentSlug === undefined) return undefined; // not provided — leave unchanged
  if (parentSlug === null) return null; // explicitly cleared
  if (parentSlug === selfSlug) {
    throw new ApiError(400, "A collection can't be its own parent");
  }
  const parent = await prisma.collection.findUnique({ where: { slug: parentSlug } });
  if (!parent) throw new ApiError(400, `Unknown parent collection: ${parentSlug}`);
  return parent.id;
}

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = collectionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const { parentSlug, ...data } = parsed.data;
    const parentId = await resolveParentId(parentSlug);

    const created = await prisma.collection.create({
      data: { ...data, ...(parentId !== undefined && { parentId }) },
    });
    res.status(201).json(created);
  })
);

router.put(
  "/:slug",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = collectionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const { parentSlug, ...data } = parsed.data;
    const parentId = await resolveParentId(parentSlug, req.params.slug);

    const updated = await prisma.collection.update({
      where: { slug: req.params.slug },
      data: { ...data, ...(parentId !== undefined && { parentId }) },
    });
    res.json(updated);
  })
);

router.delete(
  "/:slug",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    // Sub-collections of this one become top-level (parentId set to
    // null) automatically via onDelete: SetNull — they aren't deleted.
    await prisma.collection.delete({ where: { slug: req.params.slug } });
    res.status(204).send();
  })
);

export default router;
