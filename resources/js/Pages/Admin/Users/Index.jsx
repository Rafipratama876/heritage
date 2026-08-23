import AdminLayout from '@/Layouts/AdminLayout';
import { useToast } from '@/Providers/ToastProvider';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi';

export default function Index({ users }) {
    const { auth } = usePage().props;
    const { showToast } = useToast();
    const [busyId, setBusyId] = useState(null);

    function changeRole(user, role) {
        setBusyId(user.id);
        router.patch(
            route('admin.users.role', user.id),
            { role },
            {
                onSuccess: () => showToast(`${user.name}'s role updated.`, 'success'),
                onError: () => showToast("Couldn't update that user's role.", 'error'),
                onFinish: () => setBusyId(null),
            }
        );
    }

    function destroy(user) {
        if (!confirm(`Delete account for "${user.name}"? This can't be undone.`)) return;
        setBusyId(user.id);
        router.delete(route('admin.users.destroy', user.id), {
            onSuccess: () => showToast(`"${user.name}" was deleted.`, 'success'),
            onError: () => showToast('Failed to delete user.', 'error'),
            onFinish: () => setBusyId(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Admin · Users" />

            <p className="eyebrow mb-2">Accounts</p>
            <h1 className="font-display text-3xl text-ivory mb-8">Users</h1>

            <div className="border border-line">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-line text-left">
                            <th className="p-3 font-normal text-muted">Name</th>
                            <th className="p-3 font-normal text-muted">Email</th>
                            <th className="p-3 font-normal text-muted">Role</th>
                            <th className="p-3 font-normal text-muted">Joined</th>
                            <th className="p-3 font-normal text-muted w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-b border-line last:border-0">
                                <td className="p-3 text-ivory">
                                    {u.name}
                                    {u.id === auth.user.id && (
                                        <span className="ml-2 text-[10px] font-mono text-muted">(you)</span>
                                    )}
                                </td>
                                <td className="p-3 text-muted">{u.email}</td>
                                <td className="p-3">
                                    <select
                                        value={u.role}
                                        onChange={(e) => changeRole(u, e.target.value)}
                                        disabled={busyId === u.id || u.id === auth.user.id}
                                        className="input !py-1.5 !px-2 text-xs w-32"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="p-3 text-muted">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    {u.id !== auth.user.id && (
                                        <button
                                            onClick={() => destroy(u)}
                                            disabled={busyId === u.id}
                                            className="p-1.5 text-ivory/70 hover:text-clay transition-colors disabled:opacity-40"
                                        >
                                            <HiOutlineTrash />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
