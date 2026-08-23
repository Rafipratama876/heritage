<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::withCount('wishlistItems')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'wishlist_count' => $user->wishlist_items_count,
            ]);

        return Inertia::render('Admin/Users/Index', ['users' => $users]);
    }

    public function updateRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => [Rule::in(['customer', 'admin'])],
        ]);

        if ($user->id === Auth::id() && $data['role'] !== 'admin') {
            return back()->withErrors(['role' => "You can't remove your own admin access."]);
        }

        $user->update(['role' => $data['role']]);

        return back()->with('success', 'Role updated.');
    }

    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['role' => "You can't delete your own account."]);
        }

        $user->delete();

        return back()->with('success', 'User deleted.');
    }
}
