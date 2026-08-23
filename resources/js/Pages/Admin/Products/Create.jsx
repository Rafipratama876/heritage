import ProductForm from '@/Components/Admin/ProductForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create({ categories, collections }) {
    return (
        <AdminLayout>
            <Head title="Admin · New Product" />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">New Product</h1>
            <ProductForm mode="create" categories={categories} collections={collections} />
        </AdminLayout>
    );
}
