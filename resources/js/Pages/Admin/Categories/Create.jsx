import CategoryForm from '@/Components/Admin/CategoryForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AdminLayout>
            <Head title="Admin · New Category" />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">New Category</h1>
            <CategoryForm mode="create" />
        </AdminLayout>
    );
}
