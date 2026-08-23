<?php

namespace App\Support;

class GalleryTags
{
    public const LABELS = [
        'exhibition' => 'Exhibition',
        'visit' => 'Visit',
        'event' => 'Event',
        'workshop' => 'Workshop',
        'showcase' => 'Showcase',
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
