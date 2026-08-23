<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Collections/Index', [
            'collections' => Collection::with('parent')
                ->withCount('products')
                ->orderBy('name')
                ->get()
                ->map(fn (Collection $c) => $this->serialize($c)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Collections/Create', [
            'parentOptions' => Collection::orderBy('name')->get(['id', 'slug', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        Collection::create($data);

        return to_route('admin.collections.index')->with('success', 'Collection created.');
    }

    public function edit(Collection $collection): Response
    {
        return Inertia::render('Admin/Collections/Edit', [
            'collection' => $this->serialize($collection, withParentId: true),
            'parentOptions' => Collection::where('id', '!=', $collection->id)
                ->orderBy('name')
                ->get(['id', 'slug', 'name']),
        ]);
    }

    public function update(Request $request, Collection $collection)
    {
        $data = $this->validateData($request, $collection);

        if ($data['parent_id'] === $collection->id) {
            return back()->withErrors(['parent_id' => 'A collection cannot be its own parent.']);
        }

        $collection->update($data);

        return to_route('admin.collections.index')->with('success', 'Collection updated.');
    }

    public function destroy(Collection $collection)
    {
        // Children fall back to top-level via the FK's nullOnDelete, same
        // as the old backend's onDelete: SetNull behavior.
        $collection->delete();

        return to_route('admin.collections.index')->with('success', 'Collection deleted.');
    }

    private function validateData(Request $request, ?Collection $collection = null): array
    {
        return $request->validate([
            'slug' => ['required', 'string', Rule::unique('collections', 'slug')->ignore($collection)],
            'name' => ['required', 'string'],
            'tagline' => ['required', 'string'],
            'description' => ['required', 'string'],
            'image' => ['required', 'url'],
            'parent_id' => ['nullable', 'integer', 'exists:collections,id'],
        ]);
    }

    private function serialize(Collection $collection, bool $withParentId = false): array
    {
        return [
            'id' => $collection->id,
            'slug' => $collection->slug,
            'name' => $collection->name,
            'tagline' => $collection->tagline,
            'description' => $collection->description,
            'image' => $collection->image,
            'parent' => $collection->parent ? ['slug' => $collection->parent->slug, 'name' => $collection->parent->name] : null,
            'products_count' => $collection->products_count ?? null,
            ...($withParentId ? ['parent_id' => $collection->parent_id] : []),
        ];
    }
}
