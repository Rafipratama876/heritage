import cron from "node-cron";
import { prisma } from "../lib/prisma";

// How far back raw insight/event rows are kept before being purged.
// Chosen so the admin Insight page (app/admin/insight) always has at
// least the current + previous month of detail to chart, e.g. if it's
// March, everything from January and earlier gets deleted, keeping
// February onward.
const RETENTION_MONTHS = 2;

function retentionCutoff(): Date {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

// Deletes rows older than the retention window from the four raw
// event tables that feed the admin Insight dashboard
// (backend/src/routes/analytics.ts). Note this is a hard delete of
// row-level detail — the dashboard's all-time "Total ..." counters
// (totalLogins, totalViews, totalWaClicks, totalShares) are plain
// COUNT(*) queries over these same tables with no date filter, so
// those numbers will drop to reflect only what's left after cleanup.
// That trade-off (simplicity over preserving all-time totals forever)
// was a deliberate choice — ask before "fixing" it by keeping older
// rows around again.
export async function cleanupOldInsightData(): Promise<void> {
  const cutoff = retentionCutoff();

  const [loginEvents, pageViews, searchQueries, productEvents] = await Promise.all([
    prisma.loginEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.searchQuery.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.productEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);

  const total = loginEvents.count + pageViews.count + searchQueries.count + productEvents.count;
  if (total > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `[cleanupInsight] Purged rows older than ${cutoff.toISOString()}: ` +
        `${loginEvents.count} login events, ${pageViews.count} page views, ` +
        `${searchQueries.count} search queries, ${productEvents.count} product events.`
    );
  }
}

// Runs once daily at 03:00 server time (low-traffic hour) — daily rather
// than monthly so the retention window stays a rolling ~2 months instead
// of jumping in once-a-month batches, and so a missed run (e.g. restart
// during the scheduled minute) is caught by tomorrow's run instead of
// waiting weeks.
export function scheduleInsightCleanup(): void {
  cron.schedule("0 3 * * *", () => {
    cleanupOldInsightData().catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[cleanupInsight] Failed:", err);
    });
  });
}
