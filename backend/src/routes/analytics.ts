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

// GET /api/analytics/behavior — powers the admin "Customer Behavior
// Insight" table: jam aktif user (which hours of the day get the most
// page views) and new vs returning visitor, both derived from the same
// anonymous PageView rows used by /visitors.
router.get(
  "/behavior",
  asyncHandler(async (_req, res) => {
    const [hourRows, visitorSessions] = await Promise.all([
      prisma.$queryRaw<{ hour: bigint; count: bigint }[]>`
        SELECT HOUR(createdAt) as hour, COUNT(*) as count
        FROM page_views
        GROUP BY hour
        ORDER BY hour ASC
      `,
      prisma.pageView.groupBy({ by: ["visitorId", "sessionId"] }),
    ]);

    const peakHours = hourRows.map((r) => ({ hour: Number(r.hour), count: Number(r.count) }));

    const sessionCountByVisitor = new Map<string, number>();
    for (const row of visitorSessions) {
      sessionCountByVisitor.set(row.visitorId, (sessionCountByVisitor.get(row.visitorId) ?? 0) + 1);
    }
    let newVisitors = 0;
    let returningVisitors = 0;
    for (const sessionCount of sessionCountByVisitor.values()) {
      if (sessionCount > 1) returningVisitors++;
      else newVisitors++;
    }

    res.json({ peakHours, newVisitors, returningVisitors });
  })
);

// GET /api/analytics/search — powers the admin "Search Insight" table:
// most searched keywords and keywords that returned zero products
// (a signal for products worth adding to the catalog). Sourced from
// SearchQuery rows logged by POST /api/track/search.
router.get(
  "/search",
  asyncHandler(async (_req, res) => {
    const [topKeywordsRaw, zeroResultKeywordsRaw] = await Promise.all([
      prisma.searchQuery.groupBy({
        by: ["query"],
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: 10,
      }),
      prisma.searchQuery.groupBy({
        by: ["query"],
        where: { resultsCount: 0 },
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: 10,
      }),
    ]);

    res.json({
      topKeywords: topKeywordsRaw.map((r) => ({ query: r.query, count: r._count.query })),
      zeroResultKeywords: zeroResultKeywordsRaw.map((r) => ({ query: r.query, count: r._count.query })),
    });
  })
);

// GET /api/analytics/products — powers the admin "Product Insight"
// table: view counts, top-viewed/top-wishlisted ranking, WhatsApp order
// clicks, share clicks, view-to-order conversion rate, and repeat views.
// Sourced from ProductEvent (logged by POST /api/track/product) and the
// existing WishlistItem table.
router.get(
  "/products",
  asyncHandler(async (_req, res) => {
    const [
      totalViews,
      totalWaClicks,
      totalShares,
      topViewedRaw,
      topWishlistedRaw,
      repeatViewGroups,
    ] = await Promise.all([
      prisma.productEvent.count({ where: { type: "VIEW" } }),
      prisma.productEvent.count({ where: { type: "WA_CLICK" } }),
      prisma.productEvent.count({ where: { type: "SHARE" } }),
      prisma.productEvent.groupBy({
        by: ["productId"],
        where: { type: "VIEW" },
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      }),
      prisma.wishlistItem.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      }),
      prisma.productEvent.groupBy({
        by: ["visitorId", "productId"],
        where: { type: "VIEW", visitorId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const productIds = Array.from(
      new Set([...topViewedRaw.map((r) => r.productId), ...topWishlistedRaw.map((r) => r.productId)])
    );
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const topViewed = topViewedRaw.map((r) => ({
      product: productById.get(r.productId) ?? null,
      count: r._count.productId,
    }));
    const topWishlisted = topWishlistedRaw.map((r) => ({
      product: productById.get(r.productId) ?? null,
      count: r._count.productId,
    }));

    const repeatViewCount = repeatViewGroups.filter((g) => g._count._all > 1).length;
    const conversionRate = totalViews > 0 ? Math.round((totalWaClicks / totalViews) * 100) : 0;

    res.json({
      totalViews,
      totalWaClicks,
      totalShares,
      conversionRate,
      repeatViewCount,
      topViewed,
      topWishlisted,
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
