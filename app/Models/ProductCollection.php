<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['product_id', 'collection_id'])]
class ProductCollection extends Model
{
    const UPDATED_AT = null;

    const CREATED_AT = null;
}
