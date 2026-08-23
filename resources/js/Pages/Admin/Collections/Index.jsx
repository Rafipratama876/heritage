import AdminLayout from '@/Layouts/AdminLayout';
import { useToast } from '@/Providers/ToastProvider';
import { cn } from '@/lib/cn';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi';

// Flattens parent→children ordering for display: top-level first, its
// children immediately after, orphans last. Pure client-side, matches
// the old admin page's sortHierarchy() helper.
function sortHierarchy(collections) {
    const byParent = new Map();
    const topLevel = [];
    for (const c of collections) {
        if (c.parent) {
            if (!byParent.has(c.parent.slug)) byParent.set(c.parent.slug, []);
            byParent.get(c.parent.slug).push(c);
        } else {
            topLevel.push(c);
        }
    }
    const ordered = [];
    for (const c of topLevel) {
        ordered.push(c);
        ordered.push(...(byParent.get(c.slug) ?? []));
    }
    const seen = new Set(ordered.map((c) => c.slug));
    for (const c of collections) {
        if (!seen.has(c.slug)) ordered.push(c);
    }
    return ordered;
}

export default function Index({ collections }) {
    const { showToast } = useToast();
    const [deletingSlug, setDeletingSlug] = useState(null);
    const sorted = sortHierarchy(collections);

    function destroy(collection) {
        if (
            !confirm(
                `Delete "${collection.name}"? Products in this collection will need reassigning first.`
            )
        )
            return;
        setDeletingSlug(collection.slug);
        router.delete(route('admin.collections.destroy', collection.slug), {
            onSuccess: () => showToast(`"${collection.name}" was deleted.`, 'success'),
            onError: () => showToast('Failed to delete collection.', 'error'),
            onFinish: () => setDeletingSlug(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Admin · Collections" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="eyebrow mb-2">Catalog</p>
                    <h1 className="font-display text-3xl text-ivory">Collections</h1>
                </div>
                <Link href="/admin/collections/create" className="btn-primary !py-2.5 !px-5 text-sm">
                    <HiPlus /> New Collection
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sorted.map((c) => (
                    <div
                        key={c.slug}
                        className={cn('border border-line flex gap-4 p-4', c.parent && 'ml-6 border-dashed')}
                    >
                        <div className="relative w-20 h-20 bg-surface shrink-0">
                            <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            {c.parent && (
                                <p className="text-[10px] font-mono text-brass mb-1">
                                    &#8618; Sub-collection of {c.parent.name}
                                </p>
                            )}
                            <p className="font-display text-lg text-ivory">{c.name}</p>
                            <p className="text-sm text-muted truncate">{c.tagline}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <Link
                                    href={route('admin.collections.edit', c.slug)}
                                    className="text-xs text-ivory/70 hover:text-brass transition-colors flex items-center gap-1"
                                >
                                    <HiOutlinePencil /> Edit
                                </Link>
                                <button
                                    onClick={() => destroy(c)}
                                    disabled={deletingSlug === c.slug}
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
