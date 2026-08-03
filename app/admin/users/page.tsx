"use client";

import { useEffect, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { adminListUsers, adminUpdateUserRole, adminDeleteUser, AdminUser } from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {

    function load() {
      const token = readToken();
      if (!token) return;
      adminListUsers(token)
        .then(setUsers)
        .catch((e) => {
          const message = e instanceof Error ? e.message : "Failed to load users";
          setError(message);
          showToast(message, "error");
        });
    }
    
    load();
  }, []);

  async function handleRoleChange(id: string, role: "CUSTOMER" | "ADMIN") {
    const token = readToken();
    if (!token) return;
    setBusyId(id);
    try {
      const updated = await adminUpdateUserRole(token, id, role);
      setUsers((prev) => (prev ? prev.map((u) => (u.id === id ? updated : u)) : prev));
      showToast(`${updated.name}'s role updated to ${role === "ADMIN" ? "Admin" : "Customer"}.`, "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update role";
      setError(message);
      showToast(message, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete account for "${name}"? This can't be undone.`)) return;
    const token = readToken();
    if (!token) return;
    setBusyId(id);
    try {
      await adminDeleteUser(token, id);
      setUsers((prev) => (prev ? prev.filter((u) => u.id !== id) : prev));
      showToast(`"${name}"'s account was deleted.`, "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete user";
      setError(message);
      showToast(message, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="eyebrow mb-2">Accounts</p>
      <h1 className="font-display text-3xl text-ivory mb-8">Users</h1>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      {!users ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
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
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-[10px] font-mono text-muted">(you)</span>
                    )}
                  </td>
                  <td className="p-3 text-muted">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id || u.id === currentUser?.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as "CUSTOMER" | "ADMIN")}
                      className="input !py-1.5 !px-2 text-xs w-32"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="p-3 text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {u.id !== currentUser?.id && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={busyId === u.id}
                        className="p-1.5 text-ivory/70 hover:text-clay transition-colors disabled:opacity-40"
                        aria-label={`Delete ${u.name}`}
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
      )}
    </div>
  );
}
