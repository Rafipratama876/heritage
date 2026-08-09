"use client";

import { useEffect, useState } from "react";
import {
  adminFetchAnalytics,
  adminFetchVisitorInsight,
  adminFetchGa4Overview,
  adminFetchBehaviorInsight,
  adminFetchSearchInsight,
  adminFetchProductInsight,
  AnalyticsOverview,
  VisitorInsight,
  Ga4Overview,
  BehaviorInsight,
  SearchInsight,
  ProductInsight,
  InsightGroupBy,
} from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { GroupByFilter, InsightLineChart, InsightBarChart, CHART_COLORS } from "@/components/admin/InsightCharts";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function StatRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-b border-line last:border-0 flex items-center justify-between p-3 text-sm">
      <span className="text-ivory">{label}</span>
      <span className="text-right">
        <span className="text-brass font-mono">{value}</span>
        {note && <span className="block text-xs text-muted mt-0.5">{note}</span>}
      </span>
    </div>
  );
}

function Section({
  title,
  error,
  loading,
  children,
}: {
  title: string;
  error?: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-12">
      <p className="eyebrow mb-4">{title}</p>
      {error && <p className="text-clay text-sm mb-4">{error}</p>}
      {loading ? <p className="text-muted text-sm">Loading…</p> : children}
    </div>
  );
}

export default function AdminInsightPage() {
  const [groupBy, setGroupBy] = useState<InsightGroupBy>("day");

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [visitorInsight, setVisitorInsight] = useState<VisitorInsight | null>(null);
  const [visitorError, setVisitorError] = useState("");
  const [ga4, setGa4] = useState<Ga4Overview | null>(null);
  const [ga4Error, setGa4Error] = useState("");
  const [behavior, setBehavior] = useState<BehaviorInsight | null>(null);
  const [behaviorError, setBehaviorError] = useState("");
  const [search, setSearch] = useState<SearchInsight | null>(null);
  const [searchError, setSearchError] = useState("");
  const [productInsight, setProductInsight] = useState<ProductInsight | null>(null);
  const [productInsightError, setProductInsightError] = useState("");

  useEffect(() => {
    const token = readToken();
    if (!token) return;

    adminFetchAnalytics(token, groupBy)
      .then(setAnalytics)
      .catch((e) => setAnalyticsError(e instanceof Error ? e.message : "Failed to load analytics"));
    adminFetchVisitorInsight(token, groupBy)
      .then(setVisitorInsight)
      .catch((e) => setVisitorError(e instanceof Error ? e.message : "Failed to load visitor insight"));
    adminFetchGa4Overview(token)
      .then(setGa4)
      .catch((e) => setGa4Error(e instanceof Error ? e.message : "Failed to load Google Analytics"));
    adminFetchBehaviorInsight(token)
      .then(setBehavior)
      .catch((e) => setBehaviorError(e instanceof Error ? e.message : "Failed to load behavior insight"));
    adminFetchSearchInsight(token, groupBy)
      .then(setSearch)
      .catch((e) => setSearchError(e instanceof Error ? e.message : "Failed to load search insight"));
    adminFetchProductInsight(token, groupBy)
      .then(setProductInsight)
      .catch((e) => setProductInsightError(e instanceof Error ? e.message : "Failed to load product insight"));
  }, [groupBy]);

  const busiestHour = behavior?.peakHours.length
    ? behavior.peakHours.reduce((a, b) => (b.count > a.count ? b : a))
    : null;

  const topViewedBars = (productInsight?.topViewed ?? []).map((r) => ({
    name: r.product?.name ?? "(dihapus)",
    count: r.count,
  }));
  const topWishlistedBars = (productInsight?.topWishlisted ?? []).map((r) => ({
    name: r.product?.name ?? "(dihapus)",
    count: r.count,
  }));
  const topKeywordBars = (search?.topKeywords ?? []).map((k) => ({ name: k.query, count: k.count }));
  const peakHourBars = (behavior?.peakHours ?? []).map((h) => ({
    hour: `${String(h.hour).padStart(2, "0")}:00`,
    count: h.count,
  }));

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <p className="eyebrow mb-2">Analytics</p>
          <h1 className="font-display text-3xl text-ivory">Insight</h1>
          <p className="text-sm text-muted mt-2">
            Grafik ini mempengaruhi User, Visitor, Product, dan Search Insight di bawah.
          </p>
        </div>
        <GroupByFilter value={groupBy} onChange={setGroupBy} />
      </div>

      <Section title="User Insight" error={analyticsError} loading={!analytics && !analyticsError}>
        {analytics && (
          <>
            <InsightLineChart
              data={analytics.timeseries}
              groupBy={groupBy}
              series={[
                { key: "newUsers", label: "User Baru", color: CHART_COLORS.brass },
                { key: "logins", label: "Login", color: CHART_COLORS.clay },
              ]}
            />
            <div className="border border-line max-w-2xl mt-4">
              <StatRow label="Total User Terdaftar" value={String(analytics.totalUsers)} note="Jumlah seluruh akun" />
              <StatRow label="User Baru Hari Ini" value={String(analytics.newUsersToday)} />
              <StatRow label="User Aktif Hari Ini" value={String(analytics.activeToday)} />
              <StatRow label="User Aktif Bulan Ini" value={String(analytics.activeThisMonth)} />
              <StatRow label="Total Login" value={String(analytics.totalLogins)} />
              <StatRow label="Login Hari Ini" value={String(analytics.loginsToday)} />
              <StatRow
                label="User Online Sekarang"
                value={String(analytics.onlineNow)}
                note={`Aktif dalam ${analytics.onlineWindowMinutes} menit terakhir`}
              />
              <StatRow label="Returning User" value={String(analytics.returningUsers)} />
            </div>
          </>
        )}
      </Section>

      <Section title="Visitor Insight" error={visitorError} loading={!visitorInsight && !visitorError}>
        {visitorInsight && (
          <>
            <InsightLineChart
              data={visitorInsight.timeseries}
              groupBy={groupBy}
              series={[
                { key: "pageViews", label: "Page View", color: CHART_COLORS.brass },
                { key: "sessions", label: "Session", color: CHART_COLORS.clay },
              ]}
            />
            <div className="border border-line max-w-2xl mt-4">
              <StatRow label="Total Visitor" value={String(visitorInsight.totalVisitors)} />
              <StatRow label="Unique Visitor" value={String(visitorInsight.uniqueVisitors)} />
              <StatRow label="Page View" value={String(visitorInsight.pageViews)} />
              <StatRow label="Session" value={String(visitorInsight.sessions)} />
              <StatRow
                label="Average Session Duration"
                value={formatDuration(visitorInsight.avgSessionDurationSeconds)}
              />
              <StatRow label="Bounce Rate" value={`${visitorInsight.bounceRate}%`} />
              <StatRow
                label="Device"
                value={
                  Object.entries(visitorInsight.devices)
                    .map(([device, count]) => `${device}: ${count}`)
                    .join(" · ") || "—"
                }
              />
            </div>
          </>
        )}
      </Section>

      <Section title="Product Insight" error={productInsightError} loading={!productInsight && !productInsightError}>
        {productInsight && (
          <>
            <InsightLineChart
              data={productInsight.timeseries}
              groupBy={groupBy}
              series={[
                { key: "views", label: "View", color: CHART_COLORS.brass },
                { key: "waClicks", label: "Klik WA", color: CHART_COLORS.clay },
                { key: "shares", label: "Share", color: CHART_COLORS.brassdim },
              ]}
            />
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted mb-2">Produk Paling Dilihat</p>
                <InsightBarChart data={topViewedBars} xKey="name" yKey="count" horizontal color={CHART_COLORS.brass} />
              </div>
              <div>
                <p className="text-sm text-muted mb-2">Produk Paling Diwishlist</p>
                <InsightBarChart data={topWishlistedBars} xKey="name" yKey="count" horizontal color={CHART_COLORS.clay} />
              </div>
            </div>
            <div className="border border-line max-w-2xl mt-4">
              <StatRow label="Produk Dilihat" value={String(productInsight.totalViews)} note="Total view semua halaman product" />
              <StatRow label="Klik Produk to Order (WA)" value={String(productInsight.totalWaClicks)} />
              <StatRow label="Share Produk" value={String(productInsight.totalShares)} />
              <StatRow label="Conversion Rate" value={`${productInsight.conversionRate}%`} note="View → Klik Order WA" />
              <StatRow
                label="Repeat View"
                value={String(productInsight.repeatViewCount)}
                note="Produk dibuka lebih dari sekali oleh user yang sama"
              />
            </div>
          </>
        )}
      </Section>

      <Section title="Customer Behavior Insight" error={behaviorError} loading={!behavior && !behaviorError}>
        {behavior && (
          <>
            <p className="text-sm text-muted mb-2">Jam Aktif User (sepanjang waktu)</p>
            <InsightBarChart data={peakHourBars} xKey="hour" yKey="count" color={CHART_COLORS.brass} />
            <div className="border border-line max-w-2xl mt-4">
              <StatRow
                label="Jam Aktif User"
                value={busiestHour ? `${String(busiestHour.hour).padStart(2, "0")}:00` : "—"}
                note="Jam dengan page view terbanyak"
              />
              <StatRow
                label="New vs Returning Visitor"
                value={`${behavior.newVisitors} baru · ${behavior.returningVisitors} balik lagi`}
              />
            </div>
          </>
        )}
      </Section>

      <Section title="Search Insight" error={searchError} loading={!search && !searchError}>
        {search && (
          <>
            <InsightLineChart
              data={search.timeseries}
              groupBy={groupBy}
              series={[{ key: "count", label: "Pencarian", color: CHART_COLORS.brass }]}
            />
            <p className="text-sm text-muted mb-2 mt-4">Keyword Paling Sering Dicari</p>
            <InsightBarChart data={topKeywordBars} xKey="name" yKey="count" horizontal color={CHART_COLORS.brass} />
            {search.zeroResultKeywords.length > 0 && (
              <div className="border border-line max-w-2xl mt-4">
                <div className="border-b border-line p-3 bg-surface text-sm text-muted">
                  Keyword Tanpa Hasil — sinyal product yang perlu ditambah
                </div>
                {search.zeroResultKeywords.map((k) => (
                  <StatRow key={k.query} label={k.query} value={String(k.count)} />
                ))}
              </div>
            )}
          </>
        )}
      </Section>

      <Section title={`Google Analytics ${ga4 ? `(${ga4.dateRange})` : ""}`} error={ga4Error} loading={!ga4 && !ga4Error}>
        {ga4 && (
          <>
            <div className="border border-line max-w-2xl">
              <StatRow label="Active Users" value={String(ga4.activeUsers)} />
              <StatRow label="Sessions" value={String(ga4.sessions)} />
              <StatRow label="Page Views" value={String(ga4.pageViews)} />
              <StatRow label="Average Session Duration" value={formatDuration(ga4.avgSessionDurationSeconds)} />
              <StatRow label="Bounce Rate" value={`${ga4.bounceRate}%`} />
              <StatRow
                label="Device"
                value={
                  Object.entries(ga4.devices)
                    .map(([device, count]) => `${device}: ${count}`)
                    .join(" · ") || "—"
                }
              />
              <StatRow
                label="Negara/Kota"
                value={ga4.topCountries.map((c) => `${c.country}: ${c.activeUsers}`).join(" · ") || "—"}
              />
            </div>
            <p className="text-xs text-muted mt-3">
              Data dari Google Analytics 4 punya delay beberapa jam (tidak real-time seperti grafik di atas).
            </p>
          </>
        )}
      </Section>
    </div>
  );
}
