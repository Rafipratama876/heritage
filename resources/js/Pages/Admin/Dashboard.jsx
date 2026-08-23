import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    HiOutlineArrowRight,
    HiOutlineChartBar,
    HiOutlineCollection,
    HiOutlineCube,
    HiOutlinePhotograph,
    HiOutlineUsers,
} from 'react-icons/hi';

export default function AdminDashboard({ counts }) {
    const cards = [
        { icon: HiOutlineCube, label: 'Products', count: counts.products, href: '/admin/products' },
        { icon: HiOutlineCollection, label: 'Collections', count: counts.collections, href: '/admin/collections' },
        { icon: HiOutlinePhotograph, label: 'Gallery Items', count: counts.gallery, href: '/admin/gallery' },
        { icon: HiOutlineUsers, label: 'Users', count: counts.users, href: '/admin/users' },
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <p className="eyebrow mb-2">Overview</p>
            <h1 className="font-display text-3xl text-ivory mb-8">Dashboard</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="border border-line p-5 hover:border-brass transition-colors"
                    >
                        <card.icon className="text-2xl text-brass mb-3" />
                        <p className="font-mono text-2xl text-ivory">{card.count ?? '—'}</p>
                        <p className="text-sm text-muted mt-1">{card.label}</p>
                    </Link>
                ))}
            </div>

            <Link
                href="/admin/insight"
                className="mt-8 flex items-center justify-between border border-line p-5 hover:border-brass transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <HiOutlineChartBar className="text-2xl text-brass" />
                    <div>
                        <p className="text-ivory">Insight</p>
                        <p className="text-sm text-muted mt-1">
                            Lihat analitik pengunjung, produk, dan pencarian.
                        </p>
                    </div>
                </div>
                <HiOutlineArrowRight className="text-lg text-muted group-hover:text-brass transition-colors" />
            </Link>

            <p className="text-sm text-muted mt-10">
                Manage your catalog, gallery, and user accounts using the sidebar.
            </p>
        </AdminLayout>
    );
}
