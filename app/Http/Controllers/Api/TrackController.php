<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use App\Models\Product;
use App\Models\ProductEvent;
use App\Models\SearchQuery;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Public, fire-and-forget tracking endpoints — no auth, no IP or precise
 * location stored, just anonymous visitor/session ids. Powers the admin
 * insight dashboards. Mirrors backend/src/routes/track.ts from the old
 * Express API.
 */
class TrackController extends Controller
{
    public function pageView(Request $request): Response
    {
        $data = $request->validate([
            'visitor_id' => ['required', 'string', 'max:191'],
            'session_id' => ['required', 'string', 'max:191'],
            'path' => ['required', 'string', 'max:191'],
            'device' => ['required', 'in:desktop,mobile'],
        ]);

        PageView::create($data);

        return response()->noContent();
    }

    public function search(Request $request): Response
    {
        $data = $request->validate([
            'query' => ['required', 'string', 'max:191'],
            'results_count' => ['required', 'integer', 'min:0'],
        ]);

        SearchQuery::create([
            'query' => strtolower(trim($data['query'])),
            'results_count' => $data['results_count'],
        ]);

        return response()->noContent();
    }

    public function product(Request $request): Response
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer'],
            'type' => ['required', 'in:view,wa_click,share'],
            'visitor_id' => ['nullable', 'string', 'max:191'],
        ]);

        // Tracking is best-effort — an unknown product_id shouldn't
        // surface as an error to the browser, just get silently dropped.
        if (Product::whereKey($data['product_id'])->exists()) {
            ProductEvent::create($data);
        }

        return response()->noContent();
    }
}
