<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'type', 'visitor_id'])]
class ProductEvent extends Model
{
    const UPDATED_AT = null;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
