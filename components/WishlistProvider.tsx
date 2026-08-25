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
import { getWishlist, addWishlistItem, removeWishlistItem } from "@/lib/api";
import { readToken, useAuth } from "@/components/AuthProvider";
import type { Product } from "@/types";

const WISHLIST_KEY = "rizal_heritage_wishlist";

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
};

function readGuestWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(items: WishlistItem[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

type WishlistContextValue = {
  items: WishlistItem[];
  isLoading: boolean;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: () => void;
  isWishlisted: (productId: string) => boolean;
  toggleItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const wasAuthenticated = useRef(false);
  const hasMerged = useRef(false);

  // Same pattern as CartProvider: on login, merge whatever was in the
  // guest (localStorage) wishlist into the server, then treat the server
  // as the source of truth from then on.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      const token = readToken();

      if (isAuthenticated && token) {
        const justLoggedIn = !wasAuthenticated.current && !hasMerged.current;
        if (justLoggedIn) {
          const guestItems = readGuestWishlist();
          for (const item of guestItems) {
            try {
              await addWishlistItem(token, item.productId);
            } catch {
              // Skip items that fail to merge instead of blocking the rest.
            }
          }
          if (guestItems.length > 0) writeGuestWishlist([]);
          hasMerged.current = true;
        }

        try {
          const serverItems = await getWishlist(token);
          if (!cancelled) {
            setItems(
              serverItems.map((i) => ({
                productId: i.productId,
                slug: i.slug,
                name: i.name,
                price: i.price,
                image: i.image,
              }))
            );
          }
        } catch {
          if (!cancelled) setItems([]);
        }
      } else {
        hasMerged.current = false;
        if (!cancelled) setItems(readGuestWishlist());
      }

      wasAuthenticated.current = isAuthenticated;
      if (!cancelled) setIsLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);
  const toggleWishlist = useCallback(() => setIsOpen((v) => !v), []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggleItem = useCallback(
    async (product: Product) => {
      const token = readToken();
      const alreadyIn = items.some((i) => i.productId === product.id);

      if (isAuthenticated && token) {
        if (alreadyIn) {
          const updated = await removeWishlistItem(token, product.id);
          setItems(updated.map((i) => ({ productId: i.productId, slug: i.slug, name: i.name, price: i.price, image: i.image })));
        } else {
          const updated = await addWishlistItem(token, product.id);
          setItems(updated.map((i) => ({ productId: i.productId, slug: i.slug, name: i.name, price: i.price, image: i.image })));
        }
      } else {
        const current = readGuestWishlist();
        const next = alreadyIn
          ? current.filter((i) => i.productId !== product.id)
          : [
              ...current,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? null,
              },
            ];
        writeGuestWishlist(next);
        setItems(next);
      }
    },
    [items, isAuthenticated]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const token = readToken();
      if (isAuthenticated && token) {
        const updated = await removeWishlistItem(token, productId);
        setItems(updated.map((i) => ({ productId: i.productId, slug: i.slug, name: i.name, price: i.price, image: i.image })));
      } else {
        const next = readGuestWishlist().filter((i) => i.productId !== productId);
        writeGuestWishlist(next);
        setItems(next);
      }
    },
    [isAuthenticated]
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      isOpen,
      openWishlist,
      closeWishlist,
      toggleWishlist,
      isWishlisted,
      toggleItem,
      removeItem,
    }),
    [items, isLoading, isOpen, openWishlist, closeWishlist, toggleWishlist, isWishlisted, toggleItem, removeItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
