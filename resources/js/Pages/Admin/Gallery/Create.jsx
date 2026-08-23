import GalleryForm from '@/Components/Admin/GalleryForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create({ tags }) {
    return (
        <AdminLayout>
            <Head title="Admin · New Gallery Item" />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">New Gallery Item</h1>
            <GalleryForm mode="create" tags={tags} />
        </AdminLayout>
    );
}
