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

export default router;
