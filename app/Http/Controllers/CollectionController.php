<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\Product;
use App\Support\Categories;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Collection::with('children');

        // Mirrors the old GET /api/collections?all=true — by default only
        // top-level collections are returned, each with its direct children.
        if (! $request->boolean('all')) {
            $query->whereNull('parent_id');
        }

        return Inertia::render('Storefront/Collections/Index', [
            'collections' => $query->get()->map(fn (Collection $c) => $this->serialize($c, withChildren: true)),
        ]);
    }

    public function show(string $slug): Response
    {
        $collection = Collection::with(['parent', 'children', 'products.images', 'products.categories'])
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Storefront/Collections/Show', [
            'collection' => [
                ...$this->serialize($collection, withChildren: true),
                'parent' => $collection->parent ? $this->serialize($collection->parent) : null,
                'products' => $collection->products->map(fn (Product $p) => [
                    'id' => $p->id,
                    'code' => $p->code,
                    'slug' => $p->slug,
                    'name' => $p->name,
                    'price' => $p->price,
                    'available' => $p->available,
                    'images' => $p->images->sortBy('order')->pluck('url')->values(),
                    'categories' => $p->categories->map(
                        fn ($c) => ['value' => $c->category, 'label' => Categories::label($c->category)]
                    ),
                ]),
            ],
        ]);
    }

    private function serialize(Collection $collection, bool $withChildren = false): array
    {
        return [
            'slug' => $collection->slug,
            'name' => $collection->name,
            'tagline' => $collection->tagline,
            'description' => $collection->description,
            'image' => $collection->image,
            ...($withChildren ? [
                'children' => $collection->children->map(fn ($c) => $this->serialize($c)),
            ] : []),
        ];
    }
}
