<?php

namespace App\Support;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

/**
 * Product category slug <-> label lookup — backed by the `categories`
 * table (admin-editable via /admin/categories) rather than a hardcoded
 * PHP list, so the shop owner can add/rename/remove categories without a
 * code deploy. Cached for a request's lifetime (and briefly across
 * requests) since label() gets called once per category per product in
 * several list views.
 */
class Categories
{
    private static ?array $labels = null;

    private static function all(): array
    {
        return self::$labels ??= Cache::remember(
            'categories.labels',
            60,
            fn () => Category::orderBy('order')->pluck('label', 'slug')->all()
        );
    }

    public static function label(string $value): string
    {
        return self::all()[$value] ?? $value;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::all())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    /**
     * @return array<int, string> every valid category slug — used for
     * validation (Rule::in), replacing the old array_keys(LABELS) call.
     */
    public static function values(): array
    {
        return array_keys(self::all());
    }

    public static function forget(): void
    {
        self::$labels = null;
        Cache::forget('categories.labels');
    }
}
