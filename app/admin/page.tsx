"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlinePhotograph,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineArrowRight,
} from "react-icons/hi";
import {
  adminFetchProducts,
  adminFetchCollections,
  adminFetchGalleryItems,
  adminListUsers,
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

  useEffect(() => {
    const token = readToken();
    adminFetchProducts().then((p) => setCounts((c) => ({ ...c, products: p.length }))).catch(() => {});
    adminFetchCollections().then((c2) => setCounts((c) => ({ ...c, collections: c2.length }))).catch(() => {});
    adminFetchGalleryItems().then((g) => setCounts((c) => ({ ...c, gallery: g.length }))).catch(() => {});
    if (token) {
      adminListUsers(token).then((u) => setCounts((c) => ({ ...c, users: u.length }))).catch(() => {});
    }
  }, []);

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

      <Link
        href="/admin/insight"
        className="mt-8 flex items-center justify-between border border-line p-5 hover:border-brass transition-colors group"
      >
        <div className="flex items-center gap-4">
          <HiOutlineChartBar className="text-2xl text-brass" />
          <div>
            <p className="text-ivory">Insight</p>
            <p className="text-sm text-muted mt-1">
              User, visitor, product, dan search analytics — grafik per hari/minggu/bulan
            </p>
          </div>
        </div>
        <HiOutlineArrowRight className="text-lg text-muted group-hover:text-brass transition-colors" />
      </Link>

      <p className="text-sm text-muted mt-10">
        Manage your catalog, gallery, and user accounts using the sidebar.
      </p>
    </div>
  );
}
