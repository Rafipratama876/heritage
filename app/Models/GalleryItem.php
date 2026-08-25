<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['slug', 'title', 'description', 'date', 'image', 'video_url', 'tag'])]
class GalleryItem extends Model
{
    use HasFactory;
}
