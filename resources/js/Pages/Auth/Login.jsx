import Breadcrumb from '@/Components/Breadcrumb';
import Reveal from '@/Components/Reveal';
import { Spinner } from '@/Components/Skeletons';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { HiEye, HiEyeOff, HiOutlineLockClosed, HiOutlineMail } from 'react-icons/hi';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [redirectTo, setRedirectTo] = useState('/products');

    // Read via window.location (not useSearchParams) so this reads the
    // same way the old page did — set by WhatsAppOrderButton/CartDrawer
    // when a guest tries to order, so login returns them to what they
    // were doing.
    useEffect(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        if (redirect) setRedirectTo(redirect);
    }, []);

    function submit(e) {
        e.preventDefault();
        post(route('login', { redirect: redirectTo }));
    }

    return (
        <StorefrontLayout>
            <Head title="Login" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Login' }]} />

                <div className="max-w-md mx-auto">
                    <Reveal className="text-center mb-10">
                        <p className="eyebrow mb-3">Customer Access</p>
                        <h1 className="font-display text-4xl text-ivory">Login</h1>
                        <p className="text-muted mt-3 text-sm">
                            You don’t need an account to browser our catalog. Sign in to save your
                            details for a faster checkout and future orders.
                        </p>
                    </Reveal>

                    <Reveal delay={0.08} className="label-frame bg-surface p-8">
                        {status && (
                            <p className="text-sm text-brass bg-brass/10 border border-brass/20 px-4 py-3 mb-5">
                                {status}
                            </p>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {(errors.email || errors.password) && (
                                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3">
                                    {errors.email || errors.password}
                                </p>
                            )}

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
                                        autoFocus
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@example.com"
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
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
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

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-muted cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="accent-brass w-4 h-4"
                                    />
                                    Remember me
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-brass hover:text-ivory transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full !py-4 disabled:opacity-60"
                            >
                                {processing ? <Spinner /> : 'Log In'}
                            </button>
                        </form>
                    </Reveal>

                    <p className="text-center text-sm text-muted mt-8">
                        Don&apos;t have an account?{' '}
                        <Link
                            href={
                                redirectTo === '/products'
                                    ? '/register'
                                    : `/register?redirect=${encodeURIComponent(redirectTo)}`
                            }
                            className="text-brass hover:text-ivory transition-colors"
                        >
                            Create one &rarr;
                        </Link>
                    </p>

                    <p className="text-center text-sm text-muted mt-4">
                        Prefer to just browse?{' '}
                        <Link href="/products" className="text-brass hover:text-ivory transition-colors">
                            View the catalog &rarr;
                        </Link>
                    </p>
                </div>
            </div>
        </StorefrontLayout>
    );
}
