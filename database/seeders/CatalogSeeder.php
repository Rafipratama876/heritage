<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\GalleryItem;
use App\Models\Product;
use App\Support\Categories;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $collections = collect([
            ['name' => 'Heritage Batik', 'tagline' => 'Hand-stamped batik from Java\'s master craftsmen'],
            ['name' => 'Songket Royale', 'tagline' => 'Woven gold-thread songket for ceremonial wear'],
            ['name' => 'Modern Kebaya', 'tagline' => 'Contemporary kebaya for everyday elegance'],
        ])->map(function (array $data) {
            return Collection::create([
                'slug' => Str::slug($data['name']),
                'name' => $data['name'],
                'tagline' => $data['tagline'],
                'description' => fake()->paragraphs(2, true),
                'image' => 'https://picsum.photos/seed/'.Str::slug($data['name']).'/1200/800',
            ]);
        });

        $categoryValues = array_keys(Categories::LABELS);

        Product::factory()
            ->count(18)
            ->create()
            ->each(function (Product $product) use ($collections, $categoryValues) {
                foreach (range(1, fake()->numberBetween(2, 4)) as $order) {
                    $product->images()->create([
                        'url' => 'https://picsum.photos/seed/'.$product->slug.'-'.$order.'/1000/1200',
                        'order' => $order - 1,
                    ]);
                }

                foreach ([['Material', fake()->randomElement(['Cotton', 'Silk', 'Semi-sutra'])],
                          ['Origin', fake()->randomElement(['Yogyakarta', 'Palembang', 'Solo'])],
                          ['Care', 'Dry clean only']] as $i => [$label, $value]) {
                    $product->specifications()->create([
                        'label' => $label,
                        'value' => $value,
                        'order' => $i,
                    ]);
                }

                $product->categories()->create([
                    'category' => fake()->randomElement($categoryValues),
                ]);

                $product->collections()->attach(
                    $collections->random(fake()->numberBetween(1, 2))->pluck('id')
                );
            });

        GalleryItem::factory()->count(10)->create();
    }
}
