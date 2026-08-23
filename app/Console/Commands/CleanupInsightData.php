<?php

namespace App\Console\Commands;

use App\Models\LoginEvent;
use App\Models\PageView;
use App\Models\ProductEvent;
use App\Models\SearchQuery;
use Illuminate\Console\Command;

/**
 * Hard-deletes analytics rows older than a rolling retention window.
 * Ported from backend/src/jobs/cleanupInsight.ts (was a node-cron job
 * running daily at 03:00; here it's an Artisan command scheduled the
 * same way in routes/console.php).
 *
 * Trade-off carried over unchanged: the Insight dashboard's all-time
 * counters (totalLogins, etc.) are plain COUNT(*) with no date filter,
 * so they silently shrink as old rows are purged — intentional, not a bug.
 */
class CleanupInsightData extends Command
{
    protected $signature = 'insight:cleanup';

    protected $description = 'Delete analytics rows (logins, page views, searches, product events) older than the retention window';

    private const RETENTION_MONTHS = 2;

    public function handle(): int
    {
        $cutoff = now()->subMonths(self::RETENTION_MONTHS);

        $deleted = [
            'login_events' => LoginEvent::where('created_at', '<', $cutoff)->delete(),
            'page_views' => PageView::where('created_at', '<', $cutoff)->delete(),
            'search_queries' => SearchQuery::where('created_at', '<', $cutoff)->delete(),
            'product_events' => ProductEvent::where('created_at', '<', $cutoff)->delete(),
        ];

        foreach ($deleted as $table => $count) {
            $this->info("Deleted {$count} row(s) from {$table} older than {$cutoff->toDateString()}.");
        }

        return self::SUCCESS;
    }
}
