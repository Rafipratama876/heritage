import CollectionForm from '@/Components/Admin/CollectionForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ collection, parentOptions }) {
    return (
        <AdminLayout>
            <Head title={`Admin · Edit ${collection.name}`} />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">Edit Collection</h1>
            <CollectionForm mode="edit" collection={collection} parentOptions={parentOptions} />
        </AdminLayout>
    );
}
