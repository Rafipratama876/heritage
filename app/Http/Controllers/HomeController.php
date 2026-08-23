<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\GalleryItem;
use App\Models\Product;
use App\Support\Categories;
use App\Support\GalleryTags;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featured = Product::with(['images', 'categories'])
            ->where('featured', true)
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'code' => $p->code,
                'name' => $p->name,
                'price' => $p->price,
                'available' => $p->available,
                'images' => $p->images->sortBy('order')->pluck('url')->values(),
                'categories' => $p->categories->map(fn ($c) => Categories::label($c->category)),
            ]);

        $collections = Collection::whereNull('parent_id')
            ->orderBy('name')
            ->get(['slug', 'name', 'tagline', 'image']);

        $gallery = GalleryItem::orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(fn (GalleryItem $g) => [
                'slug' => $g->slug,
                'title' => $g->title,
                'image' => $g->image,
                'tag' => GalleryTags::label($g->tag),
            ]);

        return Inertia::render('Storefront/Home', [
            'featuredProducts' => $featured,
            'collections' => $collections,
            'galleryItems' => $gallery,
        ]);
    }
}
