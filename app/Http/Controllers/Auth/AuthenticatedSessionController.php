<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\LoginEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Mirrors the old backend's login transaction: bump last_login_at/
        // last_seen_at and record one login_events row, which feeds the
        // admin dashboard's "logins today" / "returning user" reporting.
        DB::transaction(function () use ($user) {
            $user->forceFill([
                'last_login_at' => now(),
                'last_seen_at' => now(),
            ])->save();

            LoginEvent::create(['user_id' => $user->id]);
        });

        // The storefront's login form appends ?redirect=... (set by
        // WhatsAppOrderButton/CartDrawer when a guest tries to check
        // out) so a successful login returns them to what they were
        // doing rather than always landing on /dashboard.
        $redirect = $request->input('redirect');
        if (is_string($redirect) && str_starts_with($redirect, '/') && ! str_starts_with($redirect, '//')) {
            return redirect($redirect);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
