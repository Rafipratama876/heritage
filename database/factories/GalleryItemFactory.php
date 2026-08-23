<?php

namespace Database\Factories;

use App\Support\GalleryTags;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GalleryItemFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 9999),
            'title' => rtrim($title, '.'),
            'description' => fake()->paragraph(),
            'date' => fake()->date('F j, Y'),
            'image' => 'https://picsum.photos/seed/'.Str::slug($title).'/1000/1200',
            'tag' => fake()->randomElement(array_keys(GalleryTags::LABELS)),
        ];
    }
}
