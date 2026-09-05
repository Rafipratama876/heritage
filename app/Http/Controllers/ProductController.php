<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\Product;
use App\Support\Categories;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * GET /products — the old ProductsClient.tsx fetched the *entire*
     * catalog once and did search/category/collection/price/sort
     * filtering client-side (with a debounced search box and an
     * artificial 350ms skeleton on mount). Reproduced the same way here
     * rather than switching to server-side pagination, since that's the
     * exact UX being matched — the catalog is small enough that this is
     * fine.
     */
    public function index(Request $request): Response
    {
        $products = Product::with(['images', 'categories', 'collections'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Product $product) => $this->serialize($product));

        return Inertia::render('Storefront/Products/Index', [
            'products' => $products,
            'collections' => Collection::orderBy('name')->get(['slug', 'name']),
            'categories' => Categories::options(),
            'initialSearch' => $request->string('search')->value(),
        ]);
    }

    /**
     * GET /api/products/search — small JSON endpoint for the navbar's
     * live SearchOverlay (a plain axios call, not an Inertia visit, so it
     * needs real JSON back rather than an Inertia page response).
     */
    public function search(Request $request)
    {
        $search = $request->string('search')->trim()->value();

        $products = Product::with(['images'])
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            }))
            ->orderByDesc('created_at')
            ->limit((int) $request->input('limit', 5))
            ->get()
            ->map(fn (Product $p) => [
                'slug' => $p->slug,
                'name' => $p->name,
                'price' => $p->price,
                'price_usd' => $p->price_usd,
                'images' => $p->images->sortBy('order')->pluck('url')->values(),
            ]);

        return response()->json(['products' => $products]);
    }

    public function show(string $slug): Response
    {
        $product = Product::with(['images', 'categories', 'specifications', 'collections'])
            ->where('slug', $slug)
            ->firstOrFail();

        $categoryValues = $product->categories->pluck('category');
        $collectionIds = $product->collections->pluck('id');

        $related = Product::with(['images', 'categories', 'collections'])
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($categoryValues, $collectionIds) {
                if ($collectionIds->isNotEmpty()) {
                    $q->orWhereHas('collections', fn ($c) => $c->whereIn('collections.id', $collectionIds));
                }
                if ($categoryValues->isNotEmpty()) {
                    $q->orWhereHas('categories', fn ($c) => $c->whereIn('category', $categoryValues));
                }
            })
            ->take(4)
            ->get();

        return Inertia::render('Storefront/Products/Show', [
            'product' => $this->serialize($product, withSpecifications: true),
            'related' => $related->map(fn (Product $p) => $this->serialize($p)),
        ]);
    }

    private function serialize(Product $product, bool $withSpecifications = false): array
    {
        return [
            'id' => $product->id,
            'code' => $product->code,
            'slug' => $product->slug,
            'name' => $product->name,
            'price' => $product->price,
            'price_usd' => $product->price_usd,
            'short_description' => $product->short_description,
            'description' => $product->description,
            'featured' => $product->featured,
            'available' => $product->available,
            'video_url' => $product->video_url,
            'images' => $product->images->sortBy('order')->pluck('url')->values(),
            'categories' => $product->categories->map(
                fn ($c) => ['value' => $c->category, 'label' => Categories::label($c->category)]
            ),
            'collections' => $product->collections->map(
                fn ($c) => ['slug' => $c->slug, 'name' => $c->name]
            ),
            ...($withSpecifications ? [
                'specifications' => $product->specifications->map(
                    fn ($s) => ['label' => $s->label, 'value' => $s->value]
                ),
            ] : []),
        ];
    }
}
