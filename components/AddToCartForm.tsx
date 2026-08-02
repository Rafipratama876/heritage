"use client";

import { useState } from "react";
import { HiMinus, HiPlus, HiOutlineShoppingBag, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

export default function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const wishlisted = isWishlisted(product.id);

  async function handleAdd() {
    setIsAdding(true);
    try {
      await addItem(product, quantity);
      setQuantity(1);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex items-stretch gap-3">
      <div className="flex items-center border border-line shrink-0">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="p-3.5 text-ivory/70 hover:text-brass transition-colors"
        >
          <HiMinus className="text-sm" />
        </button>
        <span className="font-mono text-sm w-8 text-center text-ivory">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => q + 1)}
          className="p-3.5 text-ivory/70 hover:text-brass transition-colors"
        >
          <HiPlus className="text-sm" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={isAdding}
        className={cn(
          "btn-outline flex-1 !py-4 text-base",
          isAdding && "opacity-60 pointer-events-none"
        )}
      >
        <HiOutlineShoppingBag className="text-lg" />
        {isAdding ? "Adding…" : "Add to Cart"}
      </button>

      <button
        type="button"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggleItem(product)}
        className={cn(
          "border border-line px-4 flex items-center justify-center shrink-0 transition-colors",
          wishlisted ? "text-clay border-clay" : "text-ivory/70 hover:text-clay hover:border-clay"
        )}
      >
        {wishlisted ? <HiHeart className="text-lg" /> : <HiOutlineHeart className="text-lg" />}
      </button>
    </div>
  );
}
