import { useToast } from '@/Providers/ToastProvider';
import { cn } from '@/lib/cn';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import {
    HiOutlineChartBar,
    HiOutlineCollection,
    HiOutlineCube,
    HiOutlineExternalLink,
    HiOutlineLogout,
    HiOutlinePhotograph,
    HiOutlineUsers,
    HiOutlineViewGrid,
} from 'react-icons/hi';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid, exact: true },
    { href: '/admin/products', label: 'Products', icon: HiOutlineCube },
    { href: '/admin/collections', label: 'Collections', icon: HiOutlineCollection },
    { href: '/admin/gallery', label: 'Gallery', icon: HiOutlinePhotograph },
    { href: '/admin/users', label: 'Users', icon: HiOutlineUsers },
    { href: '/admin/insight', label: 'Insight', icon: HiOutlineChartBar },
];

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const pathname = '/' + (url ?? '').split('?')[0].replace(/^\/+/, '');
    const { showToast } = useToast();
    const lastFlash = useRef(null);

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
        <div className="min-h-screen flex bg-canvas">
            <aside className="w-64 shrink-0 border-r border-line flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-line">
                    <span className="font-display text-lg text-ivory">
                        Rizal Heritage <span className="text-brass">Admin</span>
                    </span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                                    active
                                        ? 'bg-brass text-canvas'
                                        : 'text-ivory/80 hover:bg-surface hover:text-ivory'
                                )}
                            >
                                <item.icon className="text-lg" />
                                {item.label}
                            </Link>
                        );
                    })}
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
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-clay transition-colors w-full text-left"
                    >
                        <HiOutlineLogout className="text-lg" />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
            </main>
        </div>
    );
}
