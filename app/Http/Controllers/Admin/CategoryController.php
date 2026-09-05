<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\Categories;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::withCount(['assignments as products_count'])->orderBy('order')->get()->map(
                fn (Category $c) => $this->serialize($c)
            ),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Create');
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['order'] = (Category::max('order') ?? -1) + 1;

        Category::create($data);
        Categories::forget();

        return to_route('admin.categories.index')->with('success', 'Category created.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $this->serialize($category),
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $category->update($this->validateData($request, $category));
        Categories::forget();

        return to_route('admin.categories.index')->with('success', 'Category updated.');
    }

    public function destroy(Category $category)
    {
        if ($category->assignments()->exists()) {
            return back()->withErrors([
                'category' => 'This category is still assigned to one or more products — reassign them first.',
            ]);
        }

        $category->delete();
        Categories::forget();

        return to_route('admin.categories.index')->with('success', 'Category deleted.');
    }

    private function validateData(Request $request, ?Category $category = null): array
    {
        return $request->validate([
            'slug' => [
                'required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/',
                Rule::unique('categories', 'slug')->ignore($category),
            ],
            'label' => ['required', 'string', 'max:120'],
        ], [
            'slug.regex' => 'Slug can only contain lowercase letters, numbers, and underscores.',
        ]);
    }

    private function serialize(Category $category): array
    {
        return [
            'id' => $category->id,
            'slug' => $category->slug,
            'label' => $category->label,
            'products_count' => $category->products_count ?? null,
        ];
    }
}
