<?php

namespace App\Http\Controllers;

use App\Models\GalleryItem;
use App\Support\GalleryTags;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = GalleryItem::query();

        if ($tag = $request->string('tag')->value()) {
            $query->where('tag', $tag);
        }

        return Inertia::render('Storefront/Gallery/Index', [
            'items' => $query->orderByDesc('created_at')->get()->map(fn (GalleryItem $item) => [
                'slug' => $item->slug,
                'title' => $item->title,
                'description' => $item->description,
                'date' => $item->date,
                'image' => $item->image,
                'tag' => ['value' => $item->tag, 'label' => GalleryTags::label($item->tag)],
            ]),
            'tags' => GalleryTags::options(),
            'filters' => $request->only(['tag']),
        ]);
    }
}
