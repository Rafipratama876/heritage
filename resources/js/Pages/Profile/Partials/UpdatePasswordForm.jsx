import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { HiOutlineLockClosed } from 'react-icons/hi';

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function updatePassword(e) {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    }

    return (
        <section>
            <p className="eyebrow mb-1">Security</p>
            <h2 className="font-display text-xl text-ivory">Update Password</h2>
            <p className="text-sm text-muted mt-1">
                Ensure your account is using a long, random password to stay secure.
            </p>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="current_password" className="eyebrow block mb-2">
                        Current Password
                    </label>
                    <div className="relative">
                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            type="password"
                            autoComplete="current-password"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                        />
                    </div>
                    {errors.current_password && (
                        <p className="text-clay text-sm mt-1">{errors.current_password}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="eyebrow block mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="password"
                            ref={passwordInput}
                            type="password"
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                        />
                    </div>
                    {errors.password && <p className="text-clay text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="eyebrow block mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                        />
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-clay text-sm mt-1">{errors.password_confirmation}</p>
                    )}
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
