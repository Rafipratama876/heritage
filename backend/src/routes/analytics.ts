import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { fetchGa4Overview, isGa4Configured } from "../lib/ga4";

const router = Router();

router.use(requireAuth, requireAdmin);

const ONLINE_WINDOW_MINUTES = 5;

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MINUTES * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      activeToday,
      activeThisMonth,
      onlineNow,
      totalLogins,
      loginsToday,
      loginCountsByUser,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { lastSeenAt: { gte: onlineSince } } }),
      prisma.loginEvent.count(),
      prisma.loginEvent.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.loginEvent.groupBy({
        by: ["userId"],
        _count: { userId: true },
      }),
    ]);

    const returningUsers = loginCountsByUser.filter((row) => row._count.userId > 1).length;

    res.json({
      totalUsers,
      newUsersToday,
      activeToday,
      activeThisMonth,
      onlineNow,
      totalLogins,
      loginsToday,
      returningUsers,
      onlineWindowMinutes: ONLINE_WINDOW_MINUTES,
    });
  })
);

router.get(
  "/visitors",
  asyncHandler(async (_req, res) => {
    const [uniqueVisitorIds, sessionBounds, deviceCounts] = await Promise.all([
      prisma.pageView.findMany({ distinct: ["visitorId"], select: { visitorId: true } }),
      prisma.pageView.groupBy({
        by: ["sessionId"],
        _min: { createdAt: true },
        _max: { createdAt: true },
        _count: { id: true },
      }),
      prisma.pageView.groupBy({ by: ["device"], _count: { device: true } }),
    ]);

    const totalSessions = sessionBounds.length;
    const pageViews = sessionBounds.reduce((sum, s) => sum + s._count.id, 0);

    const durationsSeconds = sessionBounds.map(
      (s) => (s._max.createdAt!.getTime() - s._min.createdAt!.getTime()) / 1000
    );
    const avgSessionDurationSeconds = durationsSeconds.length
      ? Math.round(durationsSeconds.reduce((a, b) => a + b, 0) / durationsSeconds.length)
      : 0;

    const bouncedSessions = sessionBounds.filter((s) => s._count.id === 1).length;
    const bounceRate = totalSessions ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    const devices = Object.fromEntries(deviceCounts.map((d) => [d.device, d._count.device]));

    res.json({
      totalVisitors: totalSessions,
      uniqueVisitors: uniqueVisitorIds.length,
      pageViews,
      sessions: totalSessions,
      avgSessionDurationSeconds,
      bounceRate,
      devices,
    });
  })
);

// GET /api/analytics/ga4 — pulls the same kind of summary metrics as
// /visitors, but sourced from Google Analytics 4 instead of our own
// page_views table. Useful once GA4 is set up on the site, since it
// also gets you country/city data for free (no local GeoIP needed).
router.get(
  "/ga4",
  asyncHandler(async (_req, res) => {
    if (!isGa4Configured) {
      throw new ApiError(
        503,
        "Google Analytics isn't configured yet — set GA_PROPERTY_ID, GA_CLIENT_EMAIL, and GA_PRIVATE_KEY in the backend's environment."
      );
    }
    const overview = await fetchGa4Overview();
    res.json(overview);
  })
);

export default router;
