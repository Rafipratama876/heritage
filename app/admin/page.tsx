"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlinePhotograph,
  HiOutlineUsers,
} from "react-icons/hi";
import {
  adminFetchProducts,
  adminFetchCollections,
  adminFetchGalleryItems,
  adminListUsers,
  adminFetchAnalytics,
  AnalyticsOverview,
} from "@/lib/api";
import { readToken } from "@/components/AuthProvider";

const CARDS = [
  { key: "products", label: "Products", href: "/admin/products", icon: HiOutlineCube },
  { key: "collections", label: "Collections", href: "/admin/collections", icon: HiOutlineCollection },
  { key: "gallery", label: "Gallery Items", href: "/admin/gallery", icon: HiOutlinePhotograph },
  { key: "users", label: "Users", href: "/admin/users", icon: HiOutlineUsers },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({
    products: null,
    collections: null,
    gallery: null,
    users: null,
  });
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    const token = readToken();
    adminFetchProducts().then((p) => setCounts((c) => ({ ...c, products: p.length }))).catch(() => {});
    adminFetchCollections().then((c2) => setCounts((c) => ({ ...c, collections: c2.length }))).catch(() => {});
    adminFetchGalleryItems().then((g) => setCounts((c) => ({ ...c, gallery: g.length }))).catch(() => {});
    if (token) {
      adminListUsers(token).then((u) => setCounts((c) => ({ ...c, users: u.length }))).catch(() => {});
      adminFetchAnalytics(token)
        .then(setAnalytics)
        .catch((e) => setAnalyticsError(e instanceof Error ? e.message : "Failed to load analytics"));
    }
  }, []);

  const insightRows: { label: string; value: string; note: string }[] = analytics
    ? [
        { label: "Total User Terdaftar", value: String(analytics.totalUsers), note: "Jumlah seluruh akun" },
        { label: "User Baru Hari Ini", value: String(analytics.newUsersToday), note: "Registrasi hari ini" },
        { label: "User Aktif Hari Ini", value: String(analytics.activeToday), note: "Login minimal sekali" },
        { label: "User Aktif Bulan Ini", value: String(analytics.activeThisMonth), note: "User aktif dalam 30 hari" },
        { label: "Total Login", value: String(analytics.totalLogins), note: "Jumlah login" },
        { label: "Login Hari Ini", value: String(analytics.loginsToday), note: "Login harian" },
        {
          label: "User Online Sekarang",
          value: String(analytics.onlineNow),
          note: `Aktif dalam ${analytics.onlineWindowMinutes} menit terakhir`,
        },
        { label: "Returning User", value: String(analytics.returningUsers), note: "Login lebih dari sekali" },
      ]
    : [];

  return (
    <div>
      <p className="eyebrow mb-2">Overview</p>
      <h1 className="font-display text-3xl text-ivory mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="border border-line p-5 hover:border-brass transition-colors"
          >
            <card.icon className="text-2xl text-brass mb-3" />
            <p className="font-mono text-2xl text-ivory">
              {counts[card.key] ?? "—"}
            </p>
            <p className="text-sm text-muted mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <p className="eyebrow mb-4">User Insight</p>

        {analyticsError && <p className="text-clay text-sm mb-4">{analyticsError}</p>}

        {!analytics && !analyticsError ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : analytics ? (
          <div className="border border-line max-w-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left bg-surface">
                  <th className="p-3 font-normal text-muted">User Insight</th>
                  <th className="p-3 font-normal text-muted text-right">Nilai</th>
                  <th className="p-3 font-normal text-muted">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {insightRows.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-0">
                    <td className="p-3 text-ivory">{row.label}</td>
                    <td className="p-3 text-brass font-mono text-right">{row.value}</td>
                    <td className="p-3 text-muted">{row.note}</td>
                  </tr>
                ))}
                <tr>
                  <td className="p-3 text-ivory/50">First Time Visitor</td>
                  <td className="p-3 text-muted/50 font-mono text-right">—</td>
                  <td className="p-3 text-muted/50">
                    Belum tersedia — perlu pelacakan pengunjung anonim (fitur analitik terpisah)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <p className="text-sm text-muted mt-10">
        Manage your catalog, gallery, and user accounts using the sidebar.
      </p>
    </div>
  );
}
