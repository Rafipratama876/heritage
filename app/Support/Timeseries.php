<?php

namespace App\Support;

use Carbon\CarbonImmutable;

/**
 * Shared helpers for building day/week/month time-series charts on the
 * admin insight page. Ported from the old backend/src/lib/timeseries.ts.
 * All buckets are labelled by their period's start date ("YYYY-MM-DD") so
 * labels sort chronologically and line up between the SQL bucket
 * expression and the PHP-generated bucket list below.
 */
class Timeseries
{
    private const PERIODS = ['day' => 30, 'week' => 12, 'month' => 12];

    public static function parseGroupBy(?string $value): string
    {
        return in_array($value, ['week', 'month'], true) ? $value : 'day';
    }

    private static function startOfWeek(CarbonImmutable $d): CarbonImmutable
    {
        return $d->startOfDay()->startOfWeek(CarbonImmutable::MONDAY);
    }

    /** The earliest bucket's start date — used as the SQL range's lower bound. */
    public static function rangeStart(string $groupBy): CarbonImmutable
    {
        $now = CarbonImmutable::now();
        $periods = self::PERIODS[$groupBy];

        return match ($groupBy) {
            'day' => $now->startOfDay()->subDays($periods - 1),
            'week' => self::startOfWeek($now)->subWeeks($periods - 1),
            'month' => $now->startOfMonth()->subMonths($periods - 1),
        };
    }

    /**
     * Every bucket label expected in the range, oldest first, so charts
     * show a continuous axis even for buckets with zero events.
     *
     * @return array<int, string>
     */
    public static function generateBuckets(string $groupBy): array
    {
        $now = CarbonImmutable::now();
        $periods = self::PERIODS[$groupBy];
        $buckets = [];

        for ($i = $periods - 1; $i >= 0; $i--) {
            $buckets[] = match ($groupBy) {
                'day' => $now->startOfDay()->subDays($i)->format('Y-m-d'),
                'week' => self::startOfWeek($now)->subWeeks($i)->format('Y-m-d'),
                'month' => $now->startOfMonth()->subMonths($i)->format('Y-m-d'),
            };
        }

        return $buckets;
    }

    /**
     * Raw-SQL bucket expression for a given `created_at`-like column,
     * matching the label format generateBuckets() produces (MySQL syntax).
     */
    public static function bucketExpr(string $column, string $groupBy): string
    {
        return match ($groupBy) {
            'day' => "DATE_FORMAT({$column}, '%Y-%m-%d')",
            'week' => "DATE_FORMAT(DATE_SUB({$column}, INTERVAL WEEKDAY({$column}) DAY), '%Y-%m-%d')",
            'month' => "DATE_FORMAT({$column}, '%Y-%m-01')",
        };
    }

    /**
     * Merges sparse per-bucket counts from the DB onto the full bucket
     * list, defaulting missing periods to `$zero`.
     *
     * @param  array<int, string>  $buckets
     * @param  array<string, array<string, int>>  $rowsByBucket
     * @param  array<string, int>  $zero
     * @return array<int, array<string, mixed>>
     */
    public static function fillBuckets(array $buckets, array $rowsByBucket, array $zero): array
    {
        return array_map(
            fn (string $bucket) => ['bucket' => $bucket, ...($rowsByBucket[$bucket] ?? $zero)],
            $buckets
        );
    }
}
