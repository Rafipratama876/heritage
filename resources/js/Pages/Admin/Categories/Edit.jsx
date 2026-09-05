import CategoryForm from '@/Components/Admin/CategoryForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ category }) {
    return (
        <AdminLayout>
            <Head title={`Admin · Edit ${category.label}`} />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">Edit Category</h1>
            <CategoryForm mode="edit" category={category} />
        </AdminLayout>
    );
}
