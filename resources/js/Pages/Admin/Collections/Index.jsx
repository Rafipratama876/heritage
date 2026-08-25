import AdminLayout from '@/Layouts/AdminLayout';
import { useToast } from '@/Providers/ToastProvider';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi';

// Groups collections into top-level "families" (a parent + its direct
// children kept together), plus any orphans (children whose parent isn't
// in the list) as their own single-item family. Each family renders as one
// grid cell, so a parent's children always stay visually attached to it —
// unlike flattening into one list and letting a 2-column grid interleave
// them, which breaks the parent/child pairing apart across columns
// whenever a family doesn't have exactly 2 members.
function groupHierarchy(collections) {
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
    const families = topLevel.map((top) => ({ top, children: byParent.get(top.slug) ?? [] }));

    // Orphans: a child whose parent slug isn't present as a top-level
    // collection in this list (shouldn't normally happen, but render them
    // rather than silently dropping them).
    const placed = new Set(topLevel.map((c) => c.slug));
    for (const kids of byParent.values()) {
        for (const kid of kids) placed.add(kid.slug);
    }
    for (const c of collections) {
        if (!placed.has(c.slug)) {
            families.push({ top: c, children: [] });
            placed.add(c.slug);
        }
    }

    return families;
}

function CollectionCard({ c, onDelete, deleting }) {
    return (
        <div className="border border-line flex gap-4 p-4 bg-canvas">
            <div className="relative w-20 h-20 bg-surface shrink-0">
                <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
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
                        onClick={() => onDelete(c)}
                        disabled={deleting}
                        className="text-xs text-ivory/70 hover:text-clay transition-colors flex items-center gap-1 disabled:opacity-40"
                    >
                        <HiOutlineTrash /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ collections }) {
    const { showToast } = useToast();
    const [deletingSlug, setDeletingSlug] = useState(null);
    const families = groupHierarchy(collections);

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {families.map(({ top, children }) => (
                    <div key={top.slug} className="space-y-3">
                        <CollectionCard c={top} onDelete={destroy} deleting={deletingSlug === top.slug} />

                        {children.length > 0 && (
                            <div className="ml-6 pl-4 border-l border-dashed border-line space-y-3">
                                {children.map((child) => (
                                    <div key={child.slug}>
                                        <p className="text-[10px] font-mono text-brass mb-1.5">
                                            &#8618; Sub-collection of {top.name}
                                        </p>
                                        <CollectionCard
                                            c={child}
                                            onDelete={destroy}
                                            deleting={deletingSlug === child.slug}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
