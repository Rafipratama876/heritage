<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Matches the old registration form exactly: name (min 2), email,
        // a single password field with no confirmation (min 6 chars, no
        // extra complexity rules — that's all the old Express/Zod schema
        // required), optional phone.
        $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // See the identical redirect-param handling in
        // AuthenticatedSessionController@store.
        $redirect = $request->input('redirect');
        if (is_string($redirect) && str_starts_with($redirect, '/') && ! str_starts_with($redirect, '//')) {
            return redirect($redirect);
        }

        return redirect(route('dashboard', absolute: false));
    }
}
