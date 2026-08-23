import CollectionForm from '@/Components/Admin/CollectionForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create({ parentOptions }) {
    return (
        <AdminLayout>
            <Head title="Admin · New Collection" />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">New Collection</h1>
            <CollectionForm mode="create" parentOptions={parentOptions} />
        </AdminLayout>
    );
}
