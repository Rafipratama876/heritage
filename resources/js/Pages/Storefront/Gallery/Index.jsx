import Breadcrumb from '@/Components/Breadcrumb';
import GalleryMasonry from '@/Components/GalleryMasonry';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head } from '@inertiajs/react';

export default function GalleryIndex({ items }) {
    return (
        <StorefrontLayout>
            <Head title="Gallery" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]} />

                <div className="mb-16 max-w-2xl">
                    <p className="eyebrow mb-3">Moments &amp; Memories</p>
                    <h1 className="font-display text-4xl sm:text-5xl text-ivory">Gallery</h1>
                    <p className="text-muted mt-4">
                        Exhibitions, workshop visits, and events from our artisan community. Tap any
                        photo to view it full size.
                    </p>
                </div>

                <GalleryMasonry items={items} />
            </div>
        </StorefrontLayout>
    );
}
