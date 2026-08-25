<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Support\GalleryTags;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Gallery/Index', [
            'items' => GalleryItem::orderByDesc('created_at')->get()->map(
                fn (GalleryItem $item) => $this->serialize($item)
            ),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Gallery/Create', ['tags' => GalleryTags::options()]);
    }

    public function store(Request $request)
    {
        GalleryItem::create($this->validateData($request));

        return to_route('admin.gallery.index')->with('success', 'Gallery item created.');
    }

    public function edit(GalleryItem $galleryItem): Response
    {
        return Inertia::render('Admin/Gallery/Edit', [
            'item' => $this->serialize($galleryItem),
            'tags' => GalleryTags::options(),
        ]);
    }

    public function update(Request $request, GalleryItem $galleryItem)
    {
        $galleryItem->update($this->validateData($request, $galleryItem));

        return to_route('admin.gallery.index')->with('success', 'Gallery item updated.');
    }

    public function destroy(GalleryItem $galleryItem)
    {
        $galleryItem->delete();

        return to_route('admin.gallery.index')->with('success', 'Gallery item deleted.');
    }

    private function validateData(Request $request, ?GalleryItem $item = null): array
    {
        $data = $request->validate([
            'slug' => ['required', 'string', Rule::unique('gallery_items', 'slug')->ignore($item)],
            'title' => ['required', 'string'],
            'description' => ['required', 'string'],
            'date' => ['required', 'string'],
            // Neither is required on its own — an item just needs at
            // least one of the two (checked below), matching the "a
            // gallery item can be a photo or a video" behavior.
            'image' => ['nullable', 'url'],
            'video_url' => ['nullable', 'url'],
            'tag' => [Rule::in(array_keys(GalleryTags::LABELS))],
        ]);

        if (blank($data['image'] ?? null) && blank($data['video_url'] ?? null)) {
            throw ValidationException::withMessages([
                'image' => 'Add either an image or a video for this gallery item.',
            ]);
        }

        return $data;
    }

    private function serialize(GalleryItem $item): array
    {
        return [
            'slug' => $item->slug,
            'title' => $item->title,
            'description' => $item->description,
            'date' => $item->date,
            'image' => $item->image,
            'video_url' => $item->video_url,
            'tag' => $item->tag,
            'tag_label' => GalleryTags::label($item->tag),
        ];
    }
}
