import ProductForm from '@/Components/Admin/ProductForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ product, categories, collections }) {
    return (
        <AdminLayout>
            <Head title={`Admin · Edit ${product.name}`} />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">Edit Product</h1>
            <ProductForm
                mode="edit"
                product={product}
                categories={categories}
                collections={collections}
            />
        </AdminLayout>
    );
}
