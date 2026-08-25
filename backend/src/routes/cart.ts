import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Every cart route requires a logged-in user — the cart is tied to their
// account so it persists across devices/sessions.
router.use(requireAuth);

const cartInclude = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { order: "asc" as const }, take: 1 } },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

function serializeCart(cart: NonNullable<Awaited<ReturnType<typeof getOrCreateCart>>>) {
  const items = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      code: item.product.code,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0]?.url ?? null,
    },
    // Cart items are only ever created for priced products — see the
    // check in POST /items — so this is always a real number in
    // practice; `?? 0` is just a defensive fallback.
    lineTotal: (item.product.price ?? 0) * item.quantity,
  }));

  return {
    id: cart.id,
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: cartInclude,
  });
}

// GET /api/cart
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user!.sub);
    res.json(serializeCart(cart));
  })
);

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

// POST /api/cart/items — add a product, or increase quantity if it's already in the cart
router.post(
  "/items",
  asyncHandler(async (req, res) => {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const { productId, quantity } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, "Product not found");
    if (product.price == null) {
      throw new ApiError(400, "This product has no price and can't be added to a cart — order it via WhatsApp instead");
    }

    const cart = await getOrCreateCart(req.user!.sub);
    const existingItem = cart.items.find((i) => i.productId === productId);

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await getOrCreateCart(req.user!.sub);
    res.status(201).json(serializeCart(updated));
  })
);

const updateItemSchema = z.object({
  quantity: z.number().int().min(0),
});

// PATCH /api/cart/items/:itemId — set an exact quantity (0 removes the item)
router.patch(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }

    const cart = await getOrCreateCart(req.user!.sub);
    const item = cart.items.find((i) => i.id === req.params.itemId);
    if (!item) throw new ApiError(404, "Cart item not found");

    if (parsed.data.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: parsed.data.quantity },
      });
    }

    const updated = await getOrCreateCart(req.user!.sub);
    res.json(serializeCart(updated));
  })
);

// DELETE /api/cart/items/:itemId
router.delete(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user!.sub);
    const item = cart.items.find((i) => i.id === req.params.itemId);
    if (!item) throw new ApiError(404, "Cart item not found");

    await prisma.cartItem.delete({ where: { id: item.id } });

    const updated = await getOrCreateCart(req.user!.sub);
    res.json(serializeCart(updated));
  })
);

// DELETE /api/cart — empty the cart
router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user!.sub);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    const updated = await getOrCreateCart(req.user!.sub);
    res.json(serializeCart(updated));
  })
);

export default router;
