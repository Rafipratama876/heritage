import Modal from '@/Components/Modal';
import { cn } from '@/lib/cn';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    function deleteUser(e) {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    }

    function closeModal() {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    }

    return (
        <section>
            <p className="eyebrow mb-1 text-clay">Danger Zone</p>
            <h2 className="font-display text-xl text-ivory">Delete Account</h2>
            <p className="text-sm text-muted mt-1">
                Once your account is deleted, all of its data — cart, wishlist, and order
                history — will be permanently removed. This cannot be undone.
            </p>

            <button
                type="button"
                onClick={() => setConfirmingUserDeletion(true)}
                className="mt-6 border border-clay text-clay px-6 py-3 text-sm tracking-wide hover:bg-clay hover:text-canvas transition-colors"
            >
                Delete Account
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-8">
                    <h2 className="font-display text-xl text-ivory">
                        Are you sure you want to delete your account?
                    </h2>
                    <p className="text-sm text-muted mt-2">
                        Please enter your password to confirm you want to permanently delete
                        your account.
                    </p>

                    <div className="mt-6">
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            ref={passwordInput}
                            type="password"
                            autoFocus
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="w-full bg-surface border border-line px-4 py-3 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                        />
                        {errors.password && <p className="text-clay text-sm mt-2">{errors.password}</p>}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="btn-outline !py-2.5 !px-5 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={cn(
                                'bg-clay text-canvas px-5 py-2.5 text-sm tracking-wide hover:bg-ivory transition-colors',
                                processing && 'opacity-60'
                            )}
                        >
                            Delete Account
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
