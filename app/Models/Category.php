<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'label', 'order'])]
class Category extends Model
{
    // product_categories.category stores the slug string (not a foreign
    // key id), so this relation keys off `slug` rather than the usual `id`.
    public function assignments(): HasMany
    {
        return $this->hasMany(ProductCategory::class, 'category', 'slug');
    }
}
