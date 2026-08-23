<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Response;

/**
 * Ported from the old app/robots.ts / app/sitemap.ts (Next.js metadata
 * routes) — same static route list plus every product/collection slug.
 */
class SeoController extends Controller
{
    public function sitemap(): Response
    {
        $staticRoutes = ['/', '/products', '/collections', '/gallery', '/shipping', '/contact', '/login', '/register'];

        $urls = collect($staticRoutes)->map(fn ($route) => url($route));

        $urls = $urls
            ->merge(Product::pluck('slug')->map(fn ($slug) => url("/products/{$slug}")))
            ->merge(Collection::pluck('slug')->map(fn ($slug) => url("/collections/{$slug}")));

        $xml = view('sitemap', ['urls' => $urls, 'now' => now()->toAtomString()])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
