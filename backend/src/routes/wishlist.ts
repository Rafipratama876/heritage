import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Every wishlist route requires a logged-in user — like the cart, the
// wishlist is tied to their account so it persists across devices.
router.use(requireAuth);

function serializeItems(
  items: {
    id: string;
    createdAt: Date;
    product: {
      id: string;
      slug: string;
      code: string;
      name: string;
      price: number | null;
      images: { url: string }[];
    };
  }[]
) {
  return items.map((item) => ({
    id: item.id,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      code: item.product.code,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0]?.url ?? null,
    },
  }));
}

// GET /api/wishlist
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: serializeItems(items) });
  })
);

const addItemSchema = z.object({ productId: z.string().min(1) });

// POST /api/wishlist/items — idempotent: adding a product already on the
// wishlist just returns the current state instead of erroring.
router.post(
  "/items",
  asyncHandler(async (req, res) => {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const { productId } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, "Product not found");

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user!.sub, productId } },
      update: {},
      create: { userId: req.user!.sub, productId },
    });

    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(201).json({ items: serializeItems(items) });
  })
);

// DELETE /api/wishlist/items/:productId
router.delete(
  "/items/:productId",
  asyncHandler(async (req, res) => {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.sub, productId: req.params.productId },
    });

    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: serializeItems(items) });
  })
);

export default router;
