<?php

namespace App\Support;

/**
 * Single source of truth for the product category enum <-> display-label
 * mapping. The old system duplicated this (categoryMap in the Express
 * backend, CATEGORY_DISPLAY in lib/api.ts on the frontend) and the two
 * had to be kept in sync by hand — here it's defined once and shared with
 * the frontend via the `categories` Inertia shared prop.
 */
class Categories
{
    /**
     * @var array<string, string> enum value (DB) => display label
     */
    public const LABELS = [
        'batik' => 'Batik',
        'songket_tenun' => 'Songket and Tenun',
        'kebaya' => 'Kebaya',
        'accessories_jewelry' => 'Accessories and Jewelry',
        'bag' => 'Bag',
        'jewelry' => 'Jewelry',
        'plate' => 'Plate',
        'other_accessories' => 'Other Accessories',
    ];

    public static function label(string $value): string
    {
        return self::LABELS[$value] ?? $value;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::LABELS)
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }
}
