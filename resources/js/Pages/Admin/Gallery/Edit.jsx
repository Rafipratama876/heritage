import GalleryForm from '@/Components/Admin/GalleryForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ item, tags }) {
    return (
        <AdminLayout>
            <Head title={`Admin · Edit ${item.title}`} />
            <p className="eyebrow mb-2">Catalog</p>
            <h1 className="font-display text-3xl text-ivory mb-8">Edit Gallery Item</h1>
            <GalleryForm mode="edit" item={item} tags={tags} />
        </AdminLayout>
    );
}
