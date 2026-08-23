import { useToast } from '@/Providers/ToastProvider';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatIDR } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi';

export default function Index({ products }) {
    const { showToast } = useToast();
    const [deletingSlug, setDeletingSlug] = useState(null);

    function destroy(product) {
        if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
        setDeletingSlug(product.slug);
        router.delete(route('admin.products.destroy', product.slug), {
            onSuccess: () => showToast(`"${product.name}" was deleted.`, 'success'),
            onError: () => showToast('Failed to delete product.', 'error'),
            onFinish: () => setDeletingSlug(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Admin · Products" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="eyebrow mb-2">Catalog</p>
                    <h1 className="font-display text-3xl text-ivory">Products</h1>
                </div>
                <Link href="/admin/products/create" className="btn-primary !py-2.5 !px-5 text-sm">
                    <HiPlus /> New Product
                </Link>
            </div>

            {products.length === 0 ? (
                <p className="text-muted text-sm">No products yet.</p>
            ) : (
                <div className="border border-line">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-line text-left">
                                <th className="p-3 font-normal text-muted w-16"></th>
                                <th className="p-3 font-normal text-muted">Name</th>
                                <th className="p-3 font-normal text-muted">Category</th>
                                <th className="p-3 font-normal text-muted">Collection</th>
                                <th className="p-3 font-normal text-muted text-right">Price</th>
                                <th className="p-3 font-normal text-muted w-24"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.slug} className="border-b border-line last:border-0">
                                    <td className="p-3">
                                        <div className="relative w-10 h-12 bg-surface">
                                            {p.images[0] && (
                                                <img
                                                    src={p.images[0]}
                                                    alt=""
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-ivory">
                                        {p.name}
                                        {p.featured && (
                                            <span className="ml-2 text-[10px] font-mono text-brass border border-brass px-1.5 py-0.5">
                                                FEATURED
                                            </span>
                                        )}
                                        {!p.available && (
                                            <span className="ml-2 text-[10px] font-mono text-clay border border-clay px-1.5 py-0.5">
                                                UNAVAILABLE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-muted">{p.category_labels.join(', ')}</td>
                                    <td className="p-3 text-muted">
                                        {p.collections.map((c) => c.name).join(', ')}
                                    </td>
                                    <td className="p-3 text-ivory text-right font-mono">
                                        {formatIDR(p.price)}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={route('admin.products.edit', p.slug)}
                                                className="p-1.5 text-ivory/70 hover:text-brass transition-colors"
                                            >
                                                <HiOutlinePencil />
                                            </Link>
                                            <button
                                                onClick={() => destroy(p)}
                                                disabled={deletingSlug === p.slug}
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
            )}
        </AdminLayout>
    );
}
