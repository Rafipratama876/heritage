<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['visitor_id', 'session_id', 'path', 'device'])]
class PageView extends Model
{
    const UPDATED_AT = null;
}
