import Breadcrumb from '@/Components/Breadcrumb';
import Reveal from '@/Components/Reveal';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ status }) {
    return (
        <StorefrontLayout>
            <Head title="My Account" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'My Account' }]} />

                <div className="max-w-xl mx-auto">
                    <Reveal className="text-center mb-10">
                        <p className="eyebrow mb-3">Customer Access</p>
                        <h1 className="font-display text-4xl text-ivory">My Account</h1>
                        <p className="text-muted mt-3 text-sm">
                            Update your details, change your password, or close your account.
                        </p>
                    </Reveal>

                    <Reveal delay={0.08} className="label-frame bg-surface p-8">
                        <UpdateProfileInformationForm status={status} />
                    </Reveal>

                    <Reveal delay={0.12} className="label-frame bg-surface p-8 mt-8">
                        <UpdatePasswordForm />
                    </Reveal>

                    <Reveal delay={0.16} className="border border-clay/40 p-8 mt-8">
                        <DeleteUserForm />
                    </Reveal>
                </div>
            </div>
        </StorefrontLayout>
    );
}
