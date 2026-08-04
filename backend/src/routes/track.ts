import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";

const router = Router();

const trackSchema = z.object({
  visitorId: z.string().min(1).max(191),
  sessionId: z.string().min(1).max(191),
  path: z.string().min(1).max(191),
  device: z.enum(["desktop", "mobile"]),
});

// POST /api/track — public, fire-and-forget from the browser
// (components/VisitorTracker.tsx). No auth, no IP or precise location
// stored — just an anonymous visitor/session id, the path, and device
// type, enough to power the admin "Visitor Insight" dashboard.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = trackSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    await prisma.pageView.create({ data: parsed.data });
    res.status(204).send();
  })
);

const searchTrackSchema = z.object({
  query: z.string().min(1).max(191),
  resultsCount: z.number().int().min(0),
});

// POST /api/track/search — public, fire-and-forget from the navbar
// search overlay (components/SearchOverlay.tsx). Records the keyword
// and how many products it matched, to power the admin "Search
// Insight" dashboard (top keywords, zero-result keywords).
router.post(
  "/search",
  asyncHandler(async (req, res) => {
    const parsed = searchTrackSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    await prisma.searchQuery.create({
      data: { query: parsed.data.query.trim().toLowerCase(), resultsCount: parsed.data.resultsCount },
    });
    res.status(204).send();
  })
);

const productTrackSchema = z.object({
  productId: z.string().min(1).max(191),
  type: z.enum(["VIEW", "WA_CLICK", "SHARE"]),
  visitorId: z.string().min(1).max(191).optional(),
});

// POST /api/track/product — public, fire-and-forget from the product
// detail page (VIEW), WhatsAppOrderButton.tsx (WA_CLICK), and
// ShareButton.tsx (SHARE). Powers the admin "Product Insight" dashboard.
router.post(
  "/product",
  asyncHandler(async (req, res) => {
    const parsed = productTrackSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    try {
      await prisma.productEvent.create({ data: parsed.data });
    } catch {
      // Most likely an unknown productId (FK constraint) — tracking is
      // best-effort, so fail quietly rather than surfacing a 500.
    }
    res.status(204).send();
  })
);

export default router;
