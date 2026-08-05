import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { fetchGa4Overview, isGa4Configured } from "../lib/ga4";
import { bucketExpr, fillBuckets, generateBuckets, parseGroupBy, rangeStart } from "../lib/timeseries";

const router = Router();

router.use(requireAuth, requireAdmin);

const ONLINE_WINDOW_MINUTES = 5;

router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MINUTES * 60 * 1000);
    const groupBy = parseGroupBy(req.query.groupBy);
    const from = rangeStart(groupBy);
    const buckets = generateBuckets(groupBy);
    const newUsersExpr = bucketExpr("createdAt", groupBy);
    const loginsExpr = bucketExpr("createdAt", groupBy);

    const [
      totalUsers,
      newUsersToday,
      activeToday,
      activeThisMonth,
      onlineNow,
      totalLogins,
      loginsToday,
      loginCountsByUser,
      newUsersRows,
      loginRows,
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
      prisma.$queryRawUnsafe<{ bucket: string; count: bigint }[]>(
        `SELECT ${newUsersExpr} as bucket, COUNT(*) as count FROM users WHERE createdAt >= ? GROUP BY bucket`,
        from
      ),
      prisma.$queryRawUnsafe<{ bucket: string; count: bigint }[]>(
        `SELECT ${loginsExpr} as bucket, COUNT(*) as count FROM login_events WHERE createdAt >= ? GROUP BY bucket`,
        from
      ),
    ]);

    const returningUsers = loginCountsByUser.filter((row) => row._count.userId > 1).length;

    const newUsersByBucket = new Map(newUsersRows.map((r) => [r.bucket, { newUsers: Number(r.count) }]));
    const loginsByBucket = new Map(loginRows.map((r) => [r.bucket, { logins: Number(r.count) }]));
    const timeseries = buckets.map((bucket) => ({
      bucket,
      newUsers: newUsersByBucket.get(bucket)?.newUsers ?? 0,
      logins: loginsByBucket.get(bucket)?.logins ?? 0,
    }));

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
      timeseries,
    });
  })
);

router.get(
  "/visitors",
  asyncHandler(async (req, res) => {
    const groupBy = parseGroupBy(req.query.groupBy);
    const from = rangeStart(groupBy);
    const buckets = generateBuckets(groupBy);
    const bucket = bucketExpr("createdAt", groupBy);

    const [uniqueVisitorIds, sessionBounds, deviceCounts, timeseriesRows] = await Promise.all([
      prisma.pageView.findMany({ distinct: ["visitorId"], select: { visitorId: true } }),
      prisma.pageView.groupBy({
        by: ["sessionId"],
        _min: { createdAt: true },
        _max: { createdAt: true },
        _count: { id: true },
      }),
      prisma.pageView.groupBy({ by: ["device"], _count: { device: true } }),
      prisma.$queryRawUnsafe<{ bucket: string; pageViews: bigint; sessions: bigint }[]>(
        `SELECT ${bucket} as bucket, COUNT(*) as pageViews, COUNT(DISTINCT sessionId) as sessions
         FROM page_views WHERE createdAt >= ? GROUP BY bucket`,
        from
      ),
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

    const rowsByBucket = new Map(
      timeseriesRows.map((r) => [r.bucket, { pageViews: Number(r.pageViews), sessions: Number(r.sessions) }])
    );
    const timeseries = fillBuckets(buckets, rowsByBucket, { pageViews: 0, sessions: 0 });

    res.json({
      totalVisitors: totalSessions,
      uniqueVisitors: uniqueVisitorIds.length,
      pageViews,
      sessions: totalSessions,
      avgSessionDurationSeconds,
      bounceRate,
      devices,
      timeseries,
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
  asyncHandler(async (req, res) => {
    const groupBy = parseGroupBy(req.query.groupBy);
    const from = rangeStart(groupBy);
    const buckets = generateBuckets(groupBy);
    const bucket = bucketExpr("createdAt", groupBy);

    const [topKeywordsRaw, zeroResultKeywordsRaw, timeseriesRows] = await Promise.all([
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
      prisma.$queryRawUnsafe<{ bucket: string; count: bigint }[]>(
        `SELECT ${bucket} as bucket, COUNT(*) as count FROM search_queries WHERE createdAt >= ? GROUP BY bucket`,
        from
      ),
    ]);

    const rowsByBucket = new Map(timeseriesRows.map((r) => [r.bucket, { count: Number(r.count) }]));
    const timeseries = fillBuckets(buckets, rowsByBucket, { count: 0 });

    res.json({
      topKeywords: topKeywordsRaw.map((r) => ({ query: r.query, count: r._count.query })),
      zeroResultKeywords: zeroResultKeywordsRaw.map((r) => ({ query: r.query, count: r._count.query })),
      timeseries,
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
  asyncHandler(async (req, res) => {
    const groupBy = parseGroupBy(req.query.groupBy);
    const from = rangeStart(groupBy);
    const buckets = generateBuckets(groupBy);
    const bucket = bucketExpr("createdAt", groupBy);

    const [
      totalViews,
      totalWaClicks,
      totalShares,
      topViewedRaw,
      topWishlistedRaw,
      repeatViewGroups,
      timeseriesRows,
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
      prisma.$queryRawUnsafe<{ bucket: string; views: bigint; waClicks: bigint; shares: bigint }[]>(
        `SELECT ${bucket} as bucket,
                SUM(CASE WHEN type = 'VIEW' THEN 1 ELSE 0 END) as views,
                SUM(CASE WHEN type = 'WA_CLICK' THEN 1 ELSE 0 END) as waClicks,
                SUM(CASE WHEN type = 'SHARE' THEN 1 ELSE 0 END) as shares
         FROM product_events WHERE createdAt >= ? GROUP BY bucket`,
        from
      ),
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

    const rowsByBucket = new Map(
      timeseriesRows.map((r) => [
        r.bucket,
        { views: Number(r.views), waClicks: Number(r.waClicks), shares: Number(r.shares) },
      ])
    );
    const timeseries = fillBuckets(buckets, rowsByBucket, { views: 0, waClicks: 0, shares: 0 });

    res.json({
      totalViews,
      totalWaClicks,
      totalShares,
      conversionRate,
      repeatViewCount,
      topViewed,
      topWishlisted,
      timeseries,
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
