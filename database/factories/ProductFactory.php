<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'code' => strtoupper(Str::random(3)).'-'.fake()->unique()->numberBetween(1000, 9999),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'name' => Str::title($name),
            'price' => fake()->numberBetween(150_000, 5_000_000),
            'short_description' => fake()->sentence(12),
            'description' => fake()->paragraphs(3, true),
            'featured' => fake()->boolean(20),
            'available' => fake()->boolean(90),
        ];
    }
}
