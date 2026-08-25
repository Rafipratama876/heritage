"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as apiClearCart,
} from "@/lib/api";
import { readToken, useAuth } from "@/components/AuthProvider";
import type { Cart, CartItem, Product } from "@/types";

const GUEST_CART_KEY = "rizal_heritage_guest_cart";
const EMPTY_CART: Cart = { items: [], totalItems: 0, totalPrice: 0 };

function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function deriveCart(items: CartItem[]): Cart {
  return {
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

type CartContextValue = {
  cart: Cart;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const wasAuthenticated = useRef(false);
  const hasMerged = useRef(false);

  // Runs whenever auth state settles. On the transition into "logged in",
  // it merges whatever was in the guest (localStorage) cart into the
  // user's server cart, then treats the server as the source of truth.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      const token = readToken();

      if (isAuthenticated && token) {
        const justLoggedIn = !wasAuthenticated.current && !hasMerged.current;
        if (justLoggedIn) {
          const guestItems = readGuestCart();
          for (const item of guestItems) {
            try {
              await addCartItem(token, item.productId, item.quantity);
            } catch {
              // Skip items that fail to merge (e.g. product no longer
              // exists) instead of blocking the rest of the cart.
            }
          }
          if (guestItems.length > 0) writeGuestCart([]);
          hasMerged.current = true;
        }

        try {
          const serverCart = await getCart(token);
          if (!cancelled) setCart(serverCart);
        } catch {
          if (!cancelled) setCart(EMPTY_CART);
        }
      } else {
        hasMerged.current = false;
        if (!cancelled) setCart(deriveCart(readGuestCart()));
      }

      wasAuthenticated.current = isAuthenticated;
      if (!cancelled) setIsLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      // "No price" products are inquiry-only — see WhatsAppOrderButton
      // instead. Add to Cart is hidden for them in the UI; this guard
      // also keeps `product.price` narrowed to `number` below.
      if (product.price == null) return;
      const token = readToken();
      if (isAuthenticated && token) {
        const updated = await addCartItem(token, product.id, quantity);
        setCart(updated);
      } else {
        const items = readGuestCart();
        const existing = items.find((i) => i.productId === product.id);
        const next: CartItem[] = existing
          ? items.map((i) =>
              i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [
              ...items,
              {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? null,
                quantity,
              },
            ];
        writeGuestCart(next);
        setCart(deriveCart(next));
      }
      setIsOpen(true);
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const token = readToken();
      if (isAuthenticated && token) {
        const updated = await updateCartItemQuantity(token, itemId, quantity);
        setCart(updated);
      } else {
        const items = readGuestCart();
        const next =
          quantity <= 0
            ? items.filter((i) => i.id !== itemId)
            : items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        writeGuestCart(next);
        setCart(deriveCart(next));
      }
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const token = readToken();
      if (isAuthenticated && token) {
        const updated = await removeCartItem(token, itemId);
        setCart(updated);
      } else {
        const items = readGuestCart().filter((i) => i.id !== itemId);
        writeGuestCart(items);
        setCart(deriveCart(items));
      }
    },
    [isAuthenticated]
  );

  const clear = useCallback(async () => {
    const token = readToken();
    if (isAuthenticated && token) {
      const updated = await apiClearCart(token);
      setCart(updated);
    } else {
      writeGuestCart([]);
      setCart(EMPTY_CART);
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [cart, isLoading, isOpen, openCart, closeCart, toggleCart, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
