import Breadcrumb from '@/Components/Breadcrumb';
import Reveal from '@/Components/Reveal';
import { Spinner } from '@/Components/Skeletons';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    HiEye,
    HiEyeOff,
    HiOutlineLockClosed,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineUser,
} from 'react-icons/hi';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [redirectTo, setRedirectTo] = useState('/products');

    useEffect(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        if (redirect) setRedirectTo(redirect);
    }, []);

    function submit(e) {
        e.preventDefault();
        post(route('register', { redirect: redirectTo }));
    }

    const firstError = errors.name || errors.email || errors.phone || errors.password;

    return (
        <StorefrontLayout>
            <Head title="Register" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Register' }]} />

                <div className="max-w-md mx-auto">
                    <Reveal className="text-center mb-10">
                        <p className="eyebrow mb-3">Customer Access</p>
                        <h1 className="font-display text-4xl text-ivory">Create Account</h1>
                        <p className="text-muted mt-3 text-sm">
                            Create an account to place orders. Browsing the catalog never requires
                            one.
                        </p>
                    </Reveal>

                    <Reveal delay={0.08} className="label-frame bg-surface p-8">
                        <form onSubmit={submit} className="space-y-5">
                            {firstError && (
                                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3">
                                    {firstError}
                                </p>
                            )}

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
                                        minLength={2}
                                        autoComplete="name"
                                        autoFocus
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Your name"
                                        className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                                    />
                                </div>
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
                                        placeholder="you@example.com"
                                        className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                                    />
                                </div>
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
                            </div>

                            <div>
                                <label htmlFor="password" className="eyebrow block mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="At least 6 characters"
                                        className="w-full bg-canvas border border-line pl-11 pr-11 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brass p-1"
                                    >
                                        {showPassword ? <HiEyeOff /> : <HiEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full !py-4 disabled:opacity-60"
                            >
                                {processing ? <Spinner /> : 'Create Account'}
                            </button>
                        </form>
                    </Reveal>

                    <p className="text-center text-sm text-muted mt-8">
                        Already have an account?{' '}
                        <Link
                            href={
                                redirectTo === '/products'
                                    ? '/login'
                                    : `/login?redirect=${encodeURIComponent(redirectTo)}`
                            }
                            className="text-brass hover:text-ivory transition-colors"
                        >
                            Log in &rarr;
                        </Link>
                    </p>
                </div>
            </div>
        </StorefrontLayout>
    );
}
