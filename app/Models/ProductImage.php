<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['url', 'order', 'product_id'])]
class ProductImage extends Model
{
    const UPDATED_AT = null;

    const CREATED_AT = null;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
