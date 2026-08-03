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
  adminFetchVisitorInsight,
  adminFetchGa4Overview,
  AnalyticsOverview,
  VisitorInsight,
  Ga4Overview,
} from "@/lib/api";
import { readToken } from "@/components/AuthProvider";

const CARDS = [
  { key: "products", label: "Products", href: "/admin/products", icon: HiOutlineCube },
  { key: "collections", label: "Collections", href: "/admin/collections", icon: HiOutlineCollection },
  { key: "gallery", label: "Gallery Items", href: "/admin/gallery", icon: HiOutlinePhotograph },
  { key: "users", label: "Users", href: "/admin/users", icon: HiOutlineUsers },
];

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({
    products: null,
    collections: null,
    gallery: null,
    users: null,
  });
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [visitorInsight, setVisitorInsight] = useState<VisitorInsight | null>(null);
  const [visitorError, setVisitorError] = useState("");
  const [ga4, setGa4] = useState<Ga4Overview | null>(null);
  const [ga4Error, setGa4Error] = useState("");

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
      adminFetchVisitorInsight(token)
        .then(setVisitorInsight)
        .catch((e) => setVisitorError(e instanceof Error ? e.message : "Failed to load visitor insight"));
      adminFetchGa4Overview(token)
        .then(setGa4)
        .catch((e) => setGa4Error(e instanceof Error ? e.message : "Failed to load Google Analytics"));
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

      <div className="mt-12">
        <p className="eyebrow mb-4">Visitor Insight</p>

        {visitorError && <p className="text-clay text-sm mb-4">{visitorError}</p>}

        {!visitorInsight && !visitorError ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : visitorInsight ? (
          <div className="border border-line max-w-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left bg-surface">
                  <th className="p-3 font-normal text-muted">Visitor Insight</th>
                  <th className="p-3 font-normal text-muted text-right">Nilai</th>
                  <th className="p-3 font-normal text-muted">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Total Visitor</td>
                  <td className="p-3 text-brass font-mono text-right">{visitorInsight.totalVisitors}</td>
                  <td className="p-3 text-muted">Semua pengunjung (kunjungan)</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Unique Visitor</td>
                  <td className="p-3 text-brass font-mono text-right">{visitorInsight.uniqueVisitors}</td>
                  <td className="p-3 text-muted">Visitor unik (browser berbeda)</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Page View</td>
                  <td className="p-3 text-brass font-mono text-right">{visitorInsight.pageViews}</td>
                  <td className="p-3 text-muted">Total halaman dibuka</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Session</td>
                  <td className="p-3 text-brass font-mono text-right">{visitorInsight.sessions}</td>
                  <td className="p-3 text-muted">Jumlah sesi</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Average Session Duration</td>
                  <td className="p-3 text-brass font-mono text-right">
                    {formatDuration(visitorInsight.avgSessionDurationSeconds)}
                  </td>
                  <td className="p-3 text-muted">Rata-rata lama kunjungan</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Bounce Rate</td>
                  <td className="p-3 text-brass font-mono text-right">{visitorInsight.bounceRate}%</td>
                  <td className="p-3 text-muted">Keluar tanpa buka halaman lain</td>
                </tr>
                <tr className="border-b border-line last:border-0">
                  <td className="p-3 text-ivory">Device</td>
                  <td className="p-3 text-brass font-mono text-right">
                    {Object.entries(visitorInsight.devices)
                      .map(([device, count]) => `${device}: ${count}`)
                      .join(" · ") || "—"}
                  </td>
                  <td className="p-3 text-muted">Desktop / Mobile</td>
                </tr>
                <tr>
                  <td className="p-3 text-ivory/50">Negara/Kota</td>
                  <td className="p-3 text-muted/50 font-mono text-right">—</td>
                  <td className="p-3 text-muted/50">
                    Belum tersedia — perlu integrasi GeoIP (lihat catatan sebelumnya)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="mt-12">
        <p className="eyebrow mb-4">Google Analytics {ga4 && `(${ga4.dateRange})`}</p>

        {ga4Error && <p className="text-muted text-sm mb-4">{ga4Error}</p>}

        {!ga4 && !ga4Error ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : ga4 ? (
          <div className="border border-line max-w-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left bg-surface">
                  <th className="p-3 font-normal text-muted">Google Analytics</th>
                  <th className="p-3 font-normal text-muted text-right">Nilai</th>
                  <th className="p-3 font-normal text-muted">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Active Users</td>
                  <td className="p-3 text-brass font-mono text-right">{ga4.activeUsers}</td>
                  <td className="p-3 text-muted">Pengguna aktif</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Sessions</td>
                  <td className="p-3 text-brass font-mono text-right">{ga4.sessions}</td>
                  <td className="p-3 text-muted">Jumlah sesi</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Page Views</td>
                  <td className="p-3 text-brass font-mono text-right">{ga4.pageViews}</td>
                  <td className="p-3 text-muted">Total halaman dibuka</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Average Session Duration</td>
                  <td className="p-3 text-brass font-mono text-right">
                    {formatDuration(ga4.avgSessionDurationSeconds)}
                  </td>
                  <td className="p-3 text-muted">Rata-rata lama kunjungan</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Bounce Rate</td>
                  <td className="p-3 text-brass font-mono text-right">{ga4.bounceRate}%</td>
                  <td className="p-3 text-muted">Keluar tanpa interaksi</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="p-3 text-ivory">Device</td>
                  <td className="p-3 text-brass font-mono text-right">
                    {Object.entries(ga4.devices)
                      .map(([device, count]) => `${device}: ${count}`)
                      .join(" · ") || "—"}
                  </td>
                  <td className="p-3 text-muted">Desktop / Mobile / Tablet</td>
                </tr>
                <tr className="last:border-0">
                  <td className="p-3 text-ivory align-top">Negara/Kota</td>
                  <td className="p-3 text-brass font-mono text-right align-top">
                    {ga4.topCountries.length
                      ? ga4.topCountries.map((c) => (
                          <div key={c.country}>
                            {c.country}: {c.activeUsers}
                          </div>
                        ))
                      : "—"}
                  </td>
                  <td className="p-3 text-muted align-top">Top 5 asal pengunjung</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="text-xs text-muted mt-3">
          Data dari Google Analytics 4 punya delay beberapa jam (tidak real-time seperti tabel di atas).
        </p>
      </div>

      <p className="text-sm text-muted mt-10">
        Manage your catalog, gallery, and user accounts using the sidebar.
      </p>
    </div>
  );
}
