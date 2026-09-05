<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code', 'slug', 'name', 'price', 'price_usd', 'short_description', 'description',
    'featured', 'available', 'video_url',
])]
class Product extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'price_usd' => 'decimal:2',
            'featured' => 'boolean',
            'available' => 'boolean',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order');
    }

    public function specifications(): HasMany
    {
        return $this->hasMany(Specification::class)->orderBy('order');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(ProductEvent::class);
    }

    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'product_collections');
    }

    /**
     * Categories are stored as an enum string in the product_categories
     * pivot table, not a related model — expose them as a plain array.
     */
    public function categories(): HasMany
    {
        return $this->hasMany(ProductCategory::class);
    }
}
