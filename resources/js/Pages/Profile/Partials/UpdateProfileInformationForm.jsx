import { useForm, usePage } from '@inertiajs/react';
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone, HiOutlineUser } from 'react-icons/hi';

export default function UpdateProfileInformation() {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        address: user.address ?? '',
    });

    function submit(e) {
        e.preventDefault();
        patch(route('profile.update'));
    }

    return (
        <section>
            <p className="eyebrow mb-1">Account Details</p>
            <h2 className="font-display text-xl text-ivory">Profile Information</h2>
            <p className="text-sm text-muted mt-1">
                Update your name, email address, and phone number.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="name" className="eyebrow block mb-2">
                        Full Name
                    </label>
                    <div className="relative">
                        <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="name"
                            type="text"
                            required
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                        />
                    </div>
                    {errors.name && <p className="text-clay text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="eyebrow block mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="username"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                        />
                    </div>
                    {errors.email && <p className="text-clay text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="phone" className="eyebrow block mb-2">
                        Phone <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                        <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="+62 812-3456-7890"
                            className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                        />
                    </div>
                    {errors.phone && <p className="text-clay text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                    <label htmlFor="address" className="eyebrow block mb-2">
                        Shipping Address <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                        <HiOutlineLocationMarker className="absolute left-4 top-4 text-muted" />
                        <textarea
                            id="address"
                            rows={3}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Street, city, postal code, province"
                            className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors resize-none"
                        />
                    </div>
                    {errors.address && <p className="text-clay text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={processing} className="btn-primary !py-3 !px-6 text-sm disabled:opacity-60">
                        Save Changes
                    </button>
                    {recentlySuccessful && <p className="text-sm text-brass">Saved.</p>}
                </div>
            </form>
        </section>
    );
}
