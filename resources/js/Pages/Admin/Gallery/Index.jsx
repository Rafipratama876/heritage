import AdminLayout from '@/Layouts/AdminLayout';
import { useToast } from '@/Providers/ToastProvider';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi';

export default function Index({ items }) {
    const { showToast } = useToast();
    const [deletingSlug, setDeletingSlug] = useState(null);

    function destroy(item) {
        if (!confirm(`Delete "${item.title}"?`)) return;
        setDeletingSlug(item.slug);
        router.delete(route('admin.gallery.destroy', item.slug), {
            onSuccess: () => showToast(`"${item.title}" was deleted.`, 'success'),
            onError: () => showToast('Failed to delete gallery item.', 'error'),
            onFinish: () => setDeletingSlug(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Admin · Gallery" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="eyebrow mb-2">Catalog</p>
                    <h1 className="font-display text-3xl text-ivory">Gallery</h1>
                </div>
                <Link href="/admin/gallery/create" className="btn-primary !py-2.5 !px-5 text-sm">
                    <HiPlus /> New Item
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => (
                    <div key={item.slug} className="border border-line flex gap-4 p-4">
                        <div className="relative w-20 h-20 bg-surface shrink-0">
                            <img
                                src={item.image}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-mono text-brass border border-brass px-1.5 py-0.5">
                                {item.tag_label}
                            </span>
                            <p className="font-display text-lg text-ivory mt-1">{item.title}</p>
                            <p className="text-sm text-muted">{item.date}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <Link
                                    href={route('admin.gallery.edit', item.slug)}
                                    className="text-xs text-ivory/70 hover:text-brass transition-colors flex items-center gap-1"
                                >
                                    <HiOutlinePencil /> Edit
                                </Link>
                                <button
                                    onClick={() => destroy(item)}
                                    disabled={deletingSlug === item.slug}
                                    className="text-xs text-ivory/70 hover:text-clay transition-colors flex items-center gap-1 disabled:opacity-40"
                                >
                                    <HiOutlineTrash /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
