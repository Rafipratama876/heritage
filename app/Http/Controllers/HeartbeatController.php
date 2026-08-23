<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class HeartbeatController extends Controller
{
    public function store(Request $request): Response
    {
        $request->user()->forceFill(['last_seen_at' => now()])->save();

        return response()->noContent();
    }
}
