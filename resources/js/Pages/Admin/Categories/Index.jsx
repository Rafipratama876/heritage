import AdminLayout from '@/Layouts/AdminLayout';
import { useToast } from '@/Providers/ToastProvider';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi';

export default function Index({ categories }) {
    const { showToast } = useToast();
    const [deletingId, setDeletingId] = useState(null);

    function destroy(category) {
        if (!confirm(`Delete category "${category.label}"?`)) return;
        setDeletingId(category.id);
        router.delete(route('admin.categories.destroy', category.slug), {
            onSuccess: () => showToast(`"${category.label}" was deleted.`, 'success'),
            onError: (errors) =>
                showToast(errors.category ?? 'Failed to delete category.', 'error'),
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Admin · Categories" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="eyebrow mb-2">Catalog</p>
                    <h1 className="font-display text-3xl text-ivory">Categories</h1>
                </div>
                <Link href="/admin/categories/create" className="btn-primary !py-2.5 !px-5 text-sm">
                    <HiPlus /> New Category
                </Link>
            </div>

            <div className="border border-line overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                    <thead>
                        <tr className="border-b border-line text-left">
                            <th className="p-3 font-normal text-muted">Label</th>
                            <th className="p-3 font-normal text-muted">Slug</th>
                            <th className="p-3 font-normal text-muted text-right">Products</th>
                            <th className="p-3 font-normal text-muted w-24"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr key={c.id} className="border-b border-line last:border-0">
                                <td className="p-3 text-ivory">{c.label}</td>
                                <td className="p-3 text-muted font-mono text-xs">{c.slug}</td>
                                <td className="p-3 text-muted text-right">{c.products_count}</td>
                                <td className="p-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={route('admin.categories.edit', c.slug)}
                                            className="p-1.5 text-ivory/70 hover:text-brass transition-colors"
                                        >
                                            <HiOutlinePencil />
                                        </Link>
                                        <button
                                            onClick={() => destroy(c)}
                                            disabled={deletingId === c.id}
                                            className="p-1.5 text-ivory/70 hover:text-clay transition-colors disabled:opacity-40"
                                        >
                                            <HiOutlineTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
