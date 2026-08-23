import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const GUEST_CART_KEY = 'rizal_heritage_guest_cart';
const EMPTY_CART = { id: null, items: [], total_items: 0, total_price: 0 };

function readGuestCart() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(GUEST_CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeGuestCart(items) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function deriveCart(items) {
    return {
        id: null,
        items,
        total_items: items.reduce((sum, i) => sum + i.quantity, 0),
        total_price: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    };
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth?.user);
    const [cart, setCart] = useState(EMPTY_CART);
    const [isOpen, setIsOpen] = useState(false);
    const wasAuthenticated = useRef(false);
    const hasMerged = useRef(false);

    // Runs whenever auth state settles. On the transition into "logged
    // in", it merges whatever was in the guest (localStorage) cart into
    // the user's server cart, then treats the server as the source of
    // truth from then on — matches the old CartProvider's behavior.
    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (isAuthenticated) {
                const justLoggedIn = !wasAuthenticated.current && !hasMerged.current;
                if (justLoggedIn) {
                    const guestItems = readGuestCart();
                    for (const item of guestItems) {
                        try {
                            await axios.post('/api/cart/items', {
                                product_id: item.product.id,
                                quantity: item.quantity,
                            });
                        } catch {
                            // Skip items that fail to merge (e.g. product no
                            // longer exists) instead of blocking the rest.
                        }
                    }
                    if (guestItems.length > 0) writeGuestCart([]);
                    hasMerged.current = true;
                }

                try {
                    const { data } = await axios.get('/api/cart');
                    if (!cancelled) setCart(data);
                } catch {
                    if (!cancelled) setCart(EMPTY_CART);
                }
            } else {
                hasMerged.current = false;
                if (!cancelled) setCart(deriveCart(readGuestCart()));
            }

            wasAuthenticated.current = isAuthenticated;
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

    const addItem = useCallback(
        async (product, quantity = 1) => {
            if (isAuthenticated) {
                const { data } = await axios.post('/api/cart/items', {
                    product_id: product.id,
                    quantity,
                });
                setCart(data);
            } else {
                const items = readGuestCart();
                const existing = items.find((i) => i.product.id === product.id);
                const next = existing
                    ? items.map((i) =>
                          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
                      )
                    : [
                          ...items,
                          {
                              id: `guest-${product.id}`,
                              quantity,
                              product: {
                                  id: product.id,
                                  slug: product.slug,
                                  code: product.code,
                                  name: product.name,
                                  price: product.price,
                                  image: product.images?.[0] ?? null,
                              },
                          },
                      ];
                writeGuestCart(next);
                setCart(deriveCart(next));
            }
            setIsOpen(true);
        },
        [isAuthenticated]
    );

    const updateItem = useCallback(
        async (itemId, quantity) => {
            if (isAuthenticated) {
                const { data } = await axios.patch(`/api/cart/items/${itemId}`, { quantity });
                setCart(data);
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
        async (itemId) => {
            if (isAuthenticated) {
                const { data } = await axios.delete(`/api/cart/items/${itemId}`);
                setCart(data);
            } else {
                const items = readGuestCart().filter((i) => i.id !== itemId);
                writeGuestCart(items);
                setCart(deriveCart(items));
            }
        },
        [isAuthenticated]
    );

    const clear = useCallback(async () => {
        if (isAuthenticated) {
            const { data } = await axios.delete('/api/cart');
            setCart(data);
        } else {
            writeGuestCart([]);
            setCart(EMPTY_CART);
        }
    }, [isAuthenticated]);

    const value = useMemo(
        () => ({ cart, isOpen, openCart, closeCart, toggleCart, addItem, updateItem, removeItem, clear }),
        [cart, isOpen, openCart, closeCart, toggleCart, addItem, updateItem, removeItem, clear]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
}
