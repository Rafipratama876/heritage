import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const WISHLIST_KEY = 'rizal_heritage_wishlist';

function readGuestWishlist() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(WISHLIST_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeGuestWishlist(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

function serverItemsToPlain(items) {
    return items.map((i) => ({
        productId: i.product.id,
        slug: i.product.slug,
        name: i.product.name,
        price: i.product.price,
        image: i.product.image,
    }));
}

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth?.user);
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wasAuthenticated = useRef(false);
    const hasMerged = useRef(false);

    // Same pattern as CartProvider: on login, merge whatever was in the
    // guest (localStorage) wishlist into the server, then treat the
    // server as the source of truth from then on.
    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (isAuthenticated) {
                const justLoggedIn = !wasAuthenticated.current && !hasMerged.current;
                if (justLoggedIn) {
                    const guestItems = readGuestWishlist();
                    for (const item of guestItems) {
                        try {
                            await axios.post('/api/wishlist/items', { product_id: item.productId });
                        } catch {
                            // Skip items that fail to merge instead of blocking the rest.
                        }
                    }
                    if (guestItems.length > 0) writeGuestWishlist([]);
                    hasMerged.current = true;
                }

                try {
                    const { data } = await axios.get('/api/wishlist');
                    if (!cancelled) setItems(serverItemsToPlain(data.items));
                } catch {
                    if (!cancelled) setItems([]);
                }
            } else {
                hasMerged.current = false;
                if (!cancelled) setItems(readGuestWishlist());
            }

            wasAuthenticated.current = isAuthenticated;
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    const openWishlist = useCallback(() => setIsOpen(true), []);
    const closeWishlist = useCallback(() => setIsOpen(false), []);
    const toggleWishlist = useCallback(() => setIsOpen((v) => !v), []);

    const isWishlisted = useCallback(
        (productId) => items.some((i) => i.productId === productId),
        [items]
    );

    const toggleItem = useCallback(
        async (product) => {
            const alreadyIn = items.some((i) => i.productId === product.id);

            if (isAuthenticated) {
                const { data } = alreadyIn
                    ? await axios.delete(`/api/wishlist/items/${product.id}`)
                    : await axios.post('/api/wishlist/items', { product_id: product.id });
                setItems(serverItemsToPlain(data.items));
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
                              image: product.images?.[0] ?? null,
                          },
                      ];
                writeGuestWishlist(next);
                setItems(next);
            }
        },
        [items, isAuthenticated]
    );

    const removeItem = useCallback(
        async (productId) => {
            if (isAuthenticated) {
                const { data } = await axios.delete(`/api/wishlist/items/${productId}`);
                setItems(serverItemsToPlain(data.items));
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
            isOpen,
            openWishlist,
            closeWishlist,
            toggleWishlist,
            isWishlisted,
            toggleItem,
            removeItem,
        }),
        [items, isOpen, openWishlist, closeWishlist, toggleWishlist, isWishlisted, toggleItem, removeItem]
    );

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
    return ctx;
}
