<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use App\Support\Categories;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::with(['images', 'categories', 'collections'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Product $p) => $this->serialize($p));

        return Inertia::render('Admin/Products/Index', ['products' => $products]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Categories::options(),
            'collections' => Collection::orderBy('name')->get(['id', 'slug', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        $product = Product::create($this->productAttributes($data));
        $this->syncRelations($product, $data);

        return to_route('admin.products.index')->with('success', 'Product created.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['images', 'specifications', 'categories', 'collections']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => $this->serialize($product, withSpecifications: true),
            'categories' => Categories::options(),
            'collections' => Collection::orderBy('name')->get(['id', 'slug', 'name']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validateData($request, $product);

        $product->update($this->productAttributes($data));
        $this->syncRelations($product, $data);

        return to_route('admin.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return to_route('admin.products.index')->with('success', 'Product deleted.');
    }

    private function validateData(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', Rule::unique('products', 'code')->ignore($product)],
            'slug' => ['required', 'string', Rule::unique('products', 'slug')->ignore($product)],
            'name' => ['required', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'short_description' => ['required', 'string'],
            'description' => ['required', 'string'],
            'featured' => ['boolean'],
            'available' => ['boolean'],
            'video_url' => ['nullable', 'url'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => [Rule::in(array_keys(Categories::LABELS))],
            'collection_slugs' => ['required', 'array', 'min:1'],
            'collection_slugs.*' => ['string', 'exists:collections,slug'],
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['url'],
            'specifications' => ['array'],
            'specifications.*.label' => ['required_with:specifications', 'string'],
            'specifications.*.value' => ['required_with:specifications', 'string'],
        ]);
    }

    private function productAttributes(array $data): array
    {
        return [
            'code' => $data['code'],
            'slug' => $data['slug'],
            'name' => $data['name'],
            'price' => $data['price'],
            'short_description' => $data['short_description'],
            'description' => $data['description'],
            'featured' => $data['featured'] ?? false,
            'available' => $data['available'] ?? true,
            'video_url' => $data['video_url'] ?? null,
        ];
    }

    /**
     * Replace child rows wholesale (delete-then-recreate) rather than
     * diffing — mirrors the old Express backend's approach for images,
     * specifications, and categories. Collections are a real pivot table
     * so those use sync() instead.
     */
    private function syncRelations(Product $product, array $data): void
    {
        $product->images()->delete();
        foreach ($data['images'] as $order => $url) {
            $product->images()->create(['url' => $url, 'order' => $order]);
        }

        $product->specifications()->delete();
        foreach ($data['specifications'] ?? [] as $order => $spec) {
            $product->specifications()->create([
                'label' => $spec['label'],
                'value' => $spec['value'],
                'order' => $order,
            ]);
        }

        $product->categories()->delete();
        foreach ($data['categories'] as $category) {
            $product->categories()->create(['category' => $category]);
        }

        $collectionIds = Collection::whereIn('slug', $data['collection_slugs'])->pluck('id');
        $product->collections()->sync($collectionIds);
    }

    private function serialize(Product $product, bool $withSpecifications = false): array
    {
        return [
            'id' => $product->id,
            'code' => $product->code,
            'slug' => $product->slug,
            'name' => $product->name,
            'price' => $product->price,
            'short_description' => $product->short_description,
            'description' => $product->description,
            'featured' => $product->featured,
            'available' => $product->available,
            'video_url' => $product->video_url,
            'images' => $product->images->sortBy('order')->pluck('url')->values(),
            'categories' => $product->categories->pluck('category'),
            'category_labels' => $product->categories->map(fn ($c) => Categories::label($c->category)),
            'collection_slugs' => $product->collections->pluck('slug'),
            'collections' => $product->collections->map(fn ($c) => ['slug' => $c->slug, 'name' => $c->name]),
            ...($withSpecifications ? [
                'specifications' => $product->specifications->sortBy('order')->map(
                    fn ($s) => ['label' => $s->label, 'value' => $s->value]
                )->values(),
            ] : []),
        ];
    }
}
