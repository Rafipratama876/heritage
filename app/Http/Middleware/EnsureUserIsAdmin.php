<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Real server-side gate for /admin/*. The previous frontend only checked
 * the user's role client-side (in AdminShell, via useEffect) and relied on
 * the API rejecting writes — the page shell itself was reachable by anyone.
 * This middleware closes that gap: a non-admin (or guest) is rejected
 * before any admin page/controller ever runs.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            abort(403, 'This area is restricted to administrators.');
        }

        return $next($request);
    }
}
