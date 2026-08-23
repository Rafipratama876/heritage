<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        return response()->json(['items' => $this->serialize()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        // Idempotent — adding an already-wishlisted product just returns
        // the current state instead of erroring, matching the old backend.
        WishlistItem::firstOrCreate([
            'user_id' => Auth::id(),
            'product_id' => $data['product_id'],
        ]);

        return response()->json(['items' => $this->serialize()], 201);
    }

    public function destroy(Product $product)
    {
        WishlistItem::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->delete();

        return response()->json(['items' => $this->serialize()]);
    }

    private function serialize()
    {
        return WishlistItem::where('user_id', Auth::id())
            ->with(['product.images' => fn ($q) => $q->orderBy('order')])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (WishlistItem $item) => [
                'id' => $item->id,
                'product' => [
                    'id' => $item->product->id,
                    'slug' => $item->product->slug,
                    'code' => $item->product->code,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'image' => $item->product->images->first()?->url,
                ],
            ]);
    }
}
