<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['query', 'results_count'])]
class SearchQuery extends Model
{
    const UPDATED_AT = null;
}
