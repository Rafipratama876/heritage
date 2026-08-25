import { useToast } from '@/Providers/ToastProvider';
import { cn } from '@/lib/cn';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    HiMenu,
    HiOutlineChartBar,
    HiOutlineCollection,
    HiOutlineCube,
    HiOutlineExternalLink,
    HiOutlineLogout,
    HiOutlinePhotograph,
    HiOutlineUsers,
    HiOutlineViewGrid,
    HiX,
} from 'react-icons/hi';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid, exact: true },
    { href: '/admin/products', label: 'Products', icon: HiOutlineCube },
    { href: '/admin/collections', label: 'Collections', icon: HiOutlineCollection },
    { href: '/admin/gallery', label: 'Gallery', icon: HiOutlinePhotograph },
    { href: '/admin/users', label: 'Users', icon: HiOutlineUsers },
    { href: '/admin/insight', label: 'Insight', icon: HiOutlineChartBar },
];

function SidebarNav({ pathname, onNavigate }) {
    return (
        <nav className="flex-1 py-6 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                            active ? 'bg-brass text-canvas' : 'text-ivory/80 hover:bg-surface hover:text-ivory'
                        )}
                    >
                        <item.icon className="text-lg" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

function SidebarFooter({ onLogout }) {
    return (
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
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-clay transition-colors w-full text-left"
            >
                <HiOutlineLogout className="text-lg" />
                Logout
            </button>
        </div>
    );
}

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const pathname = '/' + (url ?? '').split('?')[0].replace(/^\/+/, '');
    const { showToast } = useToast();
    const lastFlash = useRef(null);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    useEffect(() => setOpen(false), [pathname]);

    // Same scroll-lock trick as the storefront Navbar's mobile menu.
    useEffect(() => {
        if (!open) return;
        const scrollY = window.scrollY;
        const { body } = document;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.overflow = 'hidden';
        return () => {
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
    }, [open]);

    // The admin CRUD controllers redirect back with ->with('success', ...)
    // — surface that through the same toast system the storefront uses,
    // instead of an inline banner.
    useEffect(() => {
        const message = props.flash?.success;
        if (message && message !== lastFlash.current) {
            lastFlash.current = message;
            showToast(message, 'success');
        }
    }, [props.flash?.success, showToast]);

    function logout() {
        router.post('/logout');
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-canvas">
            {/* Mobile top bar — only below the lg breakpoint, where the
                fixed-width sidebar wouldn't fit. */}
            <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-line shrink-0">
                <span className="font-display text-base text-ivory">
                    Rizal Heritage <span className="text-brass">Admin</span>
                </span>
                <button
                    type="button"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="text-ivory text-2xl p-1"
                >
                    {open ? <HiX /> : <HiMenu />}
                </button>
            </div>

            {/* Desktop/tablet sidebar — static, always visible at lg+. */}
            <aside className="hidden lg:flex w-64 shrink-0 border-r border-line flex-col">
                <div className="h-20 flex items-center px-6 border-b border-line">
                    <span className="font-display text-lg text-ivory">
                        Rizal Heritage <span className="text-brass">Admin</span>
                    </span>
                </div>
                <SidebarNav pathname={pathname} />
                <SidebarFooter onLogout={logout} />
            </aside>

            {/* Mobile off-canvas sidebar — portaled to <body>, same
                instant show/hide (no transition) as the storefront
                Navbar's mobile menu, for the same reasons documented
                there. */}
            {mounted &&
                createPortal(
                    <div
                        className={cn(
                            'lg:hidden fixed inset-0 z-50 bg-canvas flex flex-col',
                            open ? 'block' : 'hidden'
                        )}
                        aria-hidden={!open}
                    >
                        <div className="flex items-center justify-between h-16 px-4 border-b border-line shrink-0">
                            <span className="font-display text-base text-ivory">
                                Rizal Heritage <span className="text-brass">Admin</span>
                            </span>
                            <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setOpen(false)}
                                className="text-ivory text-2xl p-1"
                            >
                                <HiX />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto flex flex-col">
                            <SidebarNav pathname={pathname} onNavigate={() => setOpen(false)} />
                            <SidebarFooter onLogout={logout} />
                        </div>
                    </div>,
                    document.body
                )}

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">{children}</div>
            </main>
        </div>
    );
}
