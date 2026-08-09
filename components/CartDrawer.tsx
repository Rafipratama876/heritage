"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HiX, HiMinus, HiPlus, HiOutlineTrash, HiOutlineShoppingBag } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { formatIDR, buildWhatsAppCartLink, cn } from "@/lib/utils";

export default function CartDrawer() {
  const { cart, isLoading, isOpen, closeCart, updateQuantity, removeItem, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const isEmpty = cart.items.length === 0;

  // Checkout (unlike adding to cart as a guest) requires an account — see
  // WhatsAppOrderButton.tsx for the same gate on the product page.
  function handleCheckoutClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!isAuthenticated) {
      e.preventDefault();
      showToast("Please log in to check out.", "info");
      closeCart();
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    // Built here, not at render time, to avoid a hydration mismatch —
    // see the identical comment in WhatsAppOrderButton.tsx.
    e.currentTarget.href = buildWhatsAppCartLink(cart.items, cart.totalPrice, window.location.origin);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/60"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 z-[95] h-full w-full max-w-md bg-canvas border-l border-line flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-6 h-20 border-b border-line shrink-0">
              <h2 className="font-display text-xl text-ivory">
                Your Cart{" "}
                {cart.totalItems > 0 && (
                  <span className="font-mono text-sm text-brass">({cart.totalItems})</span>
                )}
              </h2>
              <button
                type="button"
                aria-label="Close cart"
                onClick={closeCart}
                className="text-ivory/70 hover:text-ivory text-2xl p-1"
              >
                <HiX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isEmpty ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
                  <HiOutlineShoppingBag className="text-4xl text-muted" />
                  <p className="text-muted">
                    {isLoading ? "Loading your cart…" : "Your cart is empty."}
                  </p>
                  {!isLoading && (
                    <Link href="/products" onClick={closeCart} className="btn-outline !px-5 !py-2.5 text-xs mt-2">
                      Browse Products
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="space-y-6">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 shrink-0 bg-surface border border-line overflow-hidden"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-display text-base text-ivory leading-snug hover:text-brass transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="font-mono text-sm text-muted mt-1">
                          {formatIDR(item.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-line">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-ivory/70 hover:text-brass transition-colors"
                            >
                              <HiMinus className="text-xs" />
                            </button>
                            <span className="font-mono text-sm w-8 text-center text-ivory">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-ivory/70 hover:text-brass transition-colors"
                            >
                              <HiPlus className="text-xs" />
                            </button>
                          </div>

                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeItem(item.id)}
                            className="text-ivory/50 hover:text-red-400 transition-colors p-2"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isEmpty && (
              <div className="border-t border-line px-6 py-6 shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Subtotal</span>
                  <span className="font-mono text-lg text-brass">
                    {formatIDR(cart.totalPrice)}
                  </span>
                </div>

                <a
                  href={buildWhatsAppCartLink(cart.items, cart.totalPrice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCheckoutClick}
                  className="btn-primary w-full !py-4"
                >
                  <FaWhatsapp className="text-lg" />
                  Checkout via WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => clear()}
                  className={cn(
                    "w-full text-center text-xs text-ivory/50 hover:text-ivory transition-colors py-1"
                  )}
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
