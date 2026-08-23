<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index()
    {
        return response()->json($this->serialize($this->cartFor(Auth::user())));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);
        $quantity = $data['quantity'] ?? 1;

        $cart = $this->cartFor(Auth::user());
        $existing = $cart->items()->where('product_id', $data['product_id'])->first();

        if ($existing) {
            $existing->update(['quantity' => $existing->quantity + $quantity]);
        } else {
            $cart->items()->create(['product_id' => $data['product_id'], 'quantity' => $quantity]);
        }

        return response()->json($this->serialize($cart->fresh()), 201);
    }

    public function update(Request $request, CartItem $item)
    {
        abort_unless($item->cart->user_id === Auth::id(), 404);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        if ($data['quantity'] === 0) {
            $item->delete();
        } else {
            $item->update(['quantity' => $data['quantity']]);
        }

        return response()->json($this->serialize($this->cartFor(Auth::user())));
    }

    public function destroy(CartItem $item)
    {
        abort_unless($item->cart->user_id === Auth::id(), 404);

        $item->delete();

        return response()->json($this->serialize($this->cartFor(Auth::user())));
    }

    public function clear()
    {
        $cart = $this->cartFor(Auth::user());
        $cart->items()->delete();

        return response()->json($this->serialize($cart->fresh()));
    }

    private function cartFor($user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id])
            ->load(['items.product.images' => fn ($q) => $q->orderBy('order')]);
    }

    private function serialize(Cart $cart): array
    {
        $items = $cart->items->map(function (CartItem $item) {
            $product = $item->product;

            return [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'product' => [
                    'id' => $product->id,
                    'slug' => $product->slug,
                    'code' => $product->code,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image' => $product->images->first()?->url,
                ],
                'line_total' => $product->price * $item->quantity,
            ];
        });

        return [
            'id' => $cart->id,
            'items' => $items,
            'total_items' => $items->sum('quantity'),
            'total_price' => $items->sum('line_total'),
        ];
    }
}
