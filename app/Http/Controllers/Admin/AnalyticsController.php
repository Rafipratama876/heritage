<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginEvent;
use App\Models\PageView;
use App\Models\Product;
use App\Models\ProductEvent;
use App\Models\SearchQuery;
use App\Models\User;
use App\Models\WishlistItem;
use App\Support\Ga4Client;
use App\Support\Timeseries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Admin-only JSON endpoints powering the Insight dashboard. Ported from
 * backend/src/routes/analytics.ts — same shapes, same MySQL bucketing
 * approach (raw SQL for time-series, Eloquent/query-builder for the rest).
 */
class AnalyticsController extends Controller
{
    private const ONLINE_WINDOW_MINUTES = 5;

    public function overview(Request $request)
    {
        $now = now();
        $startOfToday = $now->copy()->startOfDay();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $onlineSince = $now->copy()->subMinutes(self::ONLINE_WINDOW_MINUTES);
        $groupBy = Timeseries::parseGroupBy($request->query('groupBy'));
        $from = Timeseries::rangeStart($groupBy);
        $buckets = Timeseries::generateBuckets($groupBy);
        $bucketExpr = Timeseries::bucketExpr('created_at', $groupBy);

        $totalUsers = User::count();
        $newUsersToday = User::where('created_at', '>=', $startOfToday)->count();
        $activeToday = User::where('last_login_at', '>=', $startOfToday)->count();
        $activeThisMonth = User::where('last_login_at', '>=', $thirtyDaysAgo)->count();
        $onlineNow = User::where('last_seen_at', '>=', $onlineSince)->count();
        $totalLogins = LoginEvent::count();
        $loginsToday = LoginEvent::where('created_at', '>=', $startOfToday)->count();

        $returningUsers = LoginEvent::select('user_id', DB::raw('COUNT(*) as c'))
            ->groupBy('user_id')
            ->having('c', '>', 1)
            ->get()
            ->count();

        $newUsersRows = User::select(DB::raw("{$bucketExpr} as bucket"), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $from)
            ->groupBy('bucket')
            ->pluck('count', 'bucket');

        $loginRows = LoginEvent::select(DB::raw("{$bucketExpr} as bucket"), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $from)
            ->groupBy('bucket')
            ->pluck('count', 'bucket');

        $timeseries = array_map(fn (string $bucket) => [
            'bucket' => $bucket,
            'newUsers' => (int) ($newUsersRows[$bucket] ?? 0),
            'logins' => (int) ($loginRows[$bucket] ?? 0),
        ], $buckets);

        return response()->json([
            'totalUsers' => $totalUsers,
            'newUsersToday' => $newUsersToday,
            'activeToday' => $activeToday,
            'activeThisMonth' => $activeThisMonth,
            'onlineNow' => $onlineNow,
            'totalLogins' => $totalLogins,
            'loginsToday' => $loginsToday,
            'returningUsers' => $returningUsers,
            'onlineWindowMinutes' => self::ONLINE_WINDOW_MINUTES,
            'timeseries' => $timeseries,
        ]);
    }

    public function visitors(Request $request)
    {
        $groupBy = Timeseries::parseGroupBy($request->query('groupBy'));
        $from = Timeseries::rangeStart($groupBy);
        $buckets = Timeseries::generateBuckets($groupBy);
        $bucketExpr = Timeseries::bucketExpr('created_at', $groupBy);

        $uniqueVisitors = PageView::distinct('visitor_id')->count('visitor_id');

        $sessionBounds = PageView::select(
            'session_id',
            DB::raw('MIN(created_at) as started_at'),
            DB::raw('MAX(created_at) as ended_at'),
            DB::raw('COUNT(*) as views')
        )->groupBy('session_id')->get();

        $totalSessions = $sessionBounds->count();
        $pageViews = $sessionBounds->sum('views');

        $avgSessionDurationSeconds = $totalSessions
            ? (int) round($sessionBounds->avg(
                fn ($s) => abs(\Carbon\Carbon::parse($s->ended_at)->diffInSeconds(\Carbon\Carbon::parse($s->started_at)))
            ))
            : 0;

        $bouncedSessions = $sessionBounds->where('views', 1)->count();
        $bounceRate = $totalSessions ? (int) round(($bouncedSessions / $totalSessions) * 100) : 0;

        $devices = PageView::select('device', DB::raw('COUNT(*) as c'))
            ->groupBy('device')->pluck('c', 'device');

        $rows = PageView::select(
            DB::raw("{$bucketExpr} as bucket"),
            DB::raw('COUNT(*) as pageViews'),
            DB::raw('COUNT(DISTINCT session_id) as sessions')
        )->where('created_at', '>=', $from)->groupBy('bucket')->get()->keyBy('bucket');

        $timeseries = array_map(fn (string $bucket) => [
            'bucket' => $bucket,
            'pageViews' => (int) ($rows[$bucket]->pageViews ?? 0),
            'sessions' => (int) ($rows[$bucket]->sessions ?? 0),
        ], $buckets);

        return response()->json([
            'totalVisitors' => $totalSessions,
            'uniqueVisitors' => $uniqueVisitors,
            'pageViews' => $pageViews,
            'sessions' => $totalSessions,
            'avgSessionDurationSeconds' => $avgSessionDurationSeconds,
            'bounceRate' => $bounceRate,
            'devices' => $devices,
            'timeseries' => $timeseries,
        ]);
    }

    public function behavior()
    {
        $hourRows = PageView::select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')->orderBy('hour')->get();

        $peakHours = $hourRows->map(fn ($r) => ['hour' => (int) $r->hour, 'count' => (int) $r->count]);

        $sessionCounts = PageView::select('visitor_id', 'session_id')
            ->distinct()
            ->get()
            ->groupBy('visitor_id')
            ->map(fn ($rows) => $rows->count());

        $newVisitors = $sessionCounts->filter(fn ($c) => $c <= 1)->count();
        $returningVisitors = $sessionCounts->filter(fn ($c) => $c > 1)->count();

        return response()->json([
            'peakHours' => $peakHours,
            'newVisitors' => $newVisitors,
            'returningVisitors' => $returningVisitors,
        ]);
    }

    public function search(Request $request)
    {
        $groupBy = Timeseries::parseGroupBy($request->query('groupBy'));
        $from = Timeseries::rangeStart($groupBy);
        $buckets = Timeseries::generateBuckets($groupBy);
        $bucketExpr = Timeseries::bucketExpr('created_at', $groupBy);

        $topKeywords = SearchQuery::select('query', DB::raw('COUNT(*) as count'))
            ->groupBy('query')->orderByDesc('count')->limit(10)->get();

        $zeroResultKeywords = SearchQuery::select('query', DB::raw('COUNT(*) as count'))
            ->where('results_count', 0)
            ->groupBy('query')->orderByDesc('count')->limit(10)->get();

        $rows = SearchQuery::select(DB::raw("{$bucketExpr} as bucket"), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $from)->groupBy('bucket')->pluck('count', 'bucket');

        $timeseries = array_map(fn (string $bucket) => [
            'bucket' => $bucket,
            'count' => (int) ($rows[$bucket] ?? 0),
        ], $buckets);

        return response()->json([
            'topKeywords' => $topKeywords,
            'zeroResultKeywords' => $zeroResultKeywords,
            'timeseries' => $timeseries,
        ]);
    }

    public function products(Request $request)
    {
        $groupBy = Timeseries::parseGroupBy($request->query('groupBy'));
        $from = Timeseries::rangeStart($groupBy);
        $buckets = Timeseries::generateBuckets($groupBy);
        $bucketExpr = Timeseries::bucketExpr('created_at', $groupBy);

        $totalViews = ProductEvent::where('type', 'view')->count();
        $totalWaClicks = ProductEvent::where('type', 'wa_click')->count();
        $totalShares = ProductEvent::where('type', 'share')->count();

        $topViewedRaw = ProductEvent::select('product_id', DB::raw('COUNT(*) as count'))
            ->where('type', 'view')->groupBy('product_id')->orderByDesc('count')->limit(5)->get();

        $topWishlistedRaw = WishlistItem::select('product_id', DB::raw('COUNT(*) as count'))
            ->groupBy('product_id')->orderByDesc('count')->limit(5)->get();

        $productIds = $topViewedRaw->pluck('product_id')
            ->merge($topWishlistedRaw->pluck('product_id'))
            ->unique();
        $productsById = Product::whereIn('id', $productIds)->get(['id', 'name', 'slug'])->keyBy('id');

        $topViewed = $topViewedRaw->map(fn ($r) => [
            'product' => $productsById->get($r->product_id),
            'count' => (int) $r->count,
        ]);
        $topWishlisted = $topWishlistedRaw->map(fn ($r) => [
            'product' => $productsById->get($r->product_id),
            'count' => (int) $r->count,
        ]);

        $repeatViewCount = ProductEvent::select('visitor_id', 'product_id', DB::raw('COUNT(*) as c'))
            ->where('type', 'view')->whereNotNull('visitor_id')
            ->groupBy('visitor_id', 'product_id')
            ->having('c', '>', 1)
            ->get()->count();

        $conversionRate = $totalViews > 0 ? (int) round(($totalWaClicks / $totalViews) * 100) : 0;

        $rows = ProductEvent::select(
            DB::raw("{$bucketExpr} as bucket"),
            DB::raw("SUM(CASE WHEN type = 'view' THEN 1 ELSE 0 END) as views"),
            DB::raw("SUM(CASE WHEN type = 'wa_click' THEN 1 ELSE 0 END) as waClicks"),
            DB::raw("SUM(CASE WHEN type = 'share' THEN 1 ELSE 0 END) as shares")
        )->where('created_at', '>=', $from)->groupBy('bucket')->get()->keyBy('bucket');

        $timeseries = array_map(fn (string $bucket) => [
            'bucket' => $bucket,
            'views' => (int) ($rows[$bucket]->views ?? 0),
            'waClicks' => (int) ($rows[$bucket]->waClicks ?? 0),
            'shares' => (int) ($rows[$bucket]->shares ?? 0),
        ], $buckets);

        return response()->json([
            'totalViews' => $totalViews,
            'totalWaClicks' => $totalWaClicks,
            'totalShares' => $totalShares,
            'conversionRate' => $conversionRate,
            'repeatViewCount' => $repeatViewCount,
            'topViewed' => $topViewed,
            'topWishlisted' => $topWishlisted,
            'timeseries' => $timeseries,
        ]);
    }

    public function ga4()
    {
        if (! Ga4Client::isConfigured()) {
            return response()->json([
                'message' => "Google Analytics isn't configured yet — set GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY in the environment.",
            ], 503);
        }

        return response()->json(Ga4Client::fetchOverview());
    }
}
