<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CollectionFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'slug' => Str::slug($name),
            'name' => Str::title($name),
            'tagline' => fake()->sentence(6),
            'description' => fake()->paragraphs(2, true),
            'image' => 'https://picsum.photos/seed/'.Str::slug($name).'/1200/800',
        ];
    }
}
