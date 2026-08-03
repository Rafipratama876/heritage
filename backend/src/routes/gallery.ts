import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { tag } = req.query as Record<string, string>;
    const items = await prisma.galleryItem.findMany({
      where: tag ? { tag: tag as any } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const item = await prisma.galleryItem.findUnique({ where: { slug: req.params.slug } });
    if (!item) throw new ApiError(404, "Gallery item not found");
    res.json(item);
  })
);

const gallerySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  image: z.string().url(),
  tag: z.enum(["Exhibition", "Visit", "Event", "Workshop", "Showcase"]),
});

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = gallerySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const created = await prisma.galleryItem.create({ data: parsed.data });
    res.status(201).json(created);
  })
);

router.put(
  "/:slug",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = gallerySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const updated = await prisma.galleryItem.update({
      where: { slug: req.params.slug },
      data: parsed.data,
    });
    res.json(updated);
  })
);

router.delete(
  "/:slug",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.galleryItem.delete({ where: { slug: req.params.slug } });
    res.status(204).send();
  })
);

export default router;
