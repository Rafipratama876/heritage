"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiMenu, HiX, HiOutlineShoppingBag, HiOutlineSearch, HiOutlineHeart } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import SearchOverlay from "@/components/SearchOverlay";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/collections", label: "Collections" },
  { href: "/gallery", label: "Gallery" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const { cart, toggleCart } = useCart();
  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-canvas/95 backdrop-blur-md border-line"
          : "bg-canvas/60 backdrop-blur-sm border-transparent",
      )}
    >
      <nav className="container-content flex items-center justify-between h-20">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-xl sm:text-2xl tracking-wide text-ivory">
            Rizal
          </span>
          <span className="font-display italic text-xl sm:text-2xl text-brass">
            Heritage
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm tracking-wide transition-colors py-2 inline-block",
                    active ? "text-brass" : "text-ivory/80 hover:text-ivory",
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute left-0 right-0 -bottom-0.5 h-px bg-brass"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
            className="text-ivory/80 hover:text-brass transition-colors text-xl p-2"
          >
            <HiOutlineSearch />
          </button>

          <button
            type="button"
            aria-label={`Open wishlist${wishlistItems.length > 0 ? ` (${wishlistItems.length} items)` : ""}`}
            onClick={toggleWishlist}
            className="relative text-ivory/80 hover:text-brass transition-colors text-xl p-2"
          >
            <HiOutlineHeart />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brass text-canvas text-[10px] font-mono font-semibold">
                {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label={`Open cart${cart.totalItems > 0 ? ` (${cart.totalItems} items)` : ""}`}
            onClick={toggleCart}
            className="relative text-ivory/80 hover:text-brass transition-colors text-xl p-2"
          >
            <HiOutlineShoppingBag />
            {cart.totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brass text-canvas text-[10px] font-mono font-semibold">
                {cart.totalItems > 99 ? "99+" : cart.totalItems}
              </span>
            )}
          </button>

          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && user ? (
              <>
                <span className="text-sm text-ivory/80">Hi, {user.name.split(" ")[0]}</span>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="btn-outline !px-5 !py-2.5 text-xs">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="btn-outline !px-5 !py-2.5 text-xs"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline !px-5 !py-2.5 text-xs">
                  Login
                </Link>
                <Link href="/register" className="btn-primary !px-5 !py-2.5 text-xs">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden text-ivory text-2xl p-2 -mr-2"
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-canvas border-b border-line overflow-hidden"
          >
            <ul className="container-content flex flex-col py-4">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block py-3 text-base border-b border-line/60",
                        active ? "text-brass" : "text-ivory/85",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                {!isLoading && user ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="block py-3 text-base text-ivory/85 w-full text-left"
                  >
                    Logout ({user.name.split(" ")[0]})
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block py-3 text-base text-ivory/85"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block py-3 text-base text-ivory/85"
                    >
                      Register
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}