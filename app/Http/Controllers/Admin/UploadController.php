<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /admin/uploads — accepts up to 10 files under the "files" field,
     * stores them on the public disk, and returns their public URLs.
     */
    public function images(Request $request)
    {
        $request->validate([
            'files' => ['required', 'array', 'max:10'],
            'files.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        $urls = collect($request->file('files'))->map(function ($file) {
            $name = Str::random(32).'.'.$file->getClientOriginalExtension();
            $file->storeAs('uploads', $name, 'public');

            return Storage::disk('public')->url('uploads/'.$name);
        });

        return response()->json(['urls' => $urls], 201);
    }

    /**
     * POST /admin/uploads/video — accepts a single file under the "file"
     * field, much larger size ceiling than photos.
     */
    public function video(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:mp4,webm,ogg,mov', 'max:102400'],
        ]);

        $file = $request->file('file');
        $name = Str::random(32).'.'.$file->getClientOriginalExtension();
        $file->storeAs('uploads', $name, 'public');

        return response()->json(['url' => Storage::disk('public')->url('uploads/'.$name)], 201);
    }
}
