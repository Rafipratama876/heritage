import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";

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

export default router;
