"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlinePhotograph,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineExternalLink,
  HiOutlineMenu,
  HiX,
} from "react-icons/hi";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineViewGrid, exact: true },
  { href: "/admin/products", label: "Products", icon: HiOutlineCube },
  { href: "/admin/collections", label: "Collections", icon: HiOutlineCollection },
  { href: "/admin/gallery", label: "Gallery", icon: HiOutlinePhotograph },
  { href: "/admin/users", label: "Users", icon: HiOutlineUsers },
  { href: "/admin/insight", label: "Insight", icon: HiOutlineChartBar },
];

// Shared between the always-visible desktop sidebar and the slide-in
// mobile drawer, so the two stay in sync instead of drifting apart.
function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-brass text-canvas"
                : "text-ivory/80 hover:bg-surface hover:text-ivory"
            )}
          >
            <item.icon className="text-lg" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Close the mobile drawer whenever the route actually changes (not on
  // first mount), so navigating from it doesn't leave it open behind
  // the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <p className="text-muted text-sm">Checking access…</p>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canvas">
      {/* Mobile/tablet top bar — the sidebar below is desktop-only (lg+). */}
      <div className="lg:hidden h-16 shrink-0 flex items-center justify-between px-4 border-b border-line">
        <span className="font-display text-base text-ivory">
          Rizal Heritage <span className="text-brass">Admin</span>
        </span>
        <button
          type="button"
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileNavOpen((v) => !v)}
          className="text-2xl text-ivory p-1"
        >
          {mobileNavOpen ? <HiX /> : <HiOutlineMenu />}
        </button>
      </div>

      {/* Mobile/tablet nav drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-canvas border-r border-line flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-line">
              <span className="font-display text-lg text-ivory">
                Rizal Heritage <span className="text-brass">Admin</span>
              </span>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              <NavLinks pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
            </nav>
            <div className="p-3 border-t border-line space-y-1">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-ivory transition-colors"
              >
                <HiOutlineExternalLink className="text-lg" />
                View site
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-clay transition-colors"
              >
                <HiOutlineLogout className="text-lg" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-line flex-col">
        <div className="h-20 flex items-center px-6 border-b border-line">
          <span className="font-display text-lg text-ivory">
            Rizal Heritage <span className="text-brass">Admin</span>
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="p-3 border-t border-line space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-ivory transition-colors"
          >
            <HiOutlineExternalLink className="text-lg" />
            View site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-clay transition-colors"
          >
            <HiOutlineLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
