import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const CHART_COLORS = {
    brass: '#B8863F',
    clay: '#96432E',
    brassdim: '#8E6E38',
    ivory: '#3A2A18',
    muted: '#8A7357',
    line: '#E0CDA6',
};

const GROUP_BY_OPTIONS = [
    { value: 'day', label: 'Per Hari' },
    { value: 'week', label: 'Per Minggu' },
    { value: 'month', label: 'Per Bulan' },
];

function GroupByFilter({ value, onChange }) {
    return (
        <div className="inline-flex border border-line">
            {GROUP_BY_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-4 py-2 text-sm transition-colors ${
                        value === opt.value ? 'bg-brass text-canvas' : 'text-ivory/80 hover:bg-surface'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function Section({ title, loading, error, children }) {
    return (
        <div className="mt-12">
            <p className="eyebrow mb-4">{title}</p>
            {error && <p className="text-clay text-sm mb-4">{error}</p>}
            {loading ? <p className="text-muted text-sm">Loading…</p> : children}
        </div>
    );
}

function StatRow({ label, value, note }) {
    return (
        <div className="border-b border-line last:border-0 flex items-center justify-between p-3 text-sm">
            <span className="text-ivory">{label}</span>
            <span className="font-mono text-brass text-right">
                {value}
                {note && <span className="block text-xs text-muted mt-0.5 font-body">{note}</span>}
            </span>
        </div>
    );
}

function InsightLineChart({ data, series }) {
    return (
        <div className="border border-line p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid stroke={CHART_COLORS.line} strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
                    <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
                    <Tooltip
                        contentStyle={{ background: '#FBF7F0', border: '1px solid #E0CDA6', fontSize: 13 }}
                    />
                    {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    {series.map((s) => (
                        <Line
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={s.name}
                            stroke={CHART_COLORS[s.color] ?? CHART_COLORS.brass}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function InsightBarChart({ data, dataKey, name, horizontal = false }) {
    if (!data.length) {
        return (
            <div className="border border-line p-4 h-64 flex items-center justify-center">
                <p className="text-muted text-sm">Belum ada data</p>
            </div>
        );
    }

    const height = Math.max(220, data.length * 40);

    return (
        <div className="border border-line p-4" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
                    <CartesianGrid stroke={CHART_COLORS.line} strokeDasharray="3 3" />
                    {horizontal ? (
                        <>
                            <XAxis type="number" tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
                            <YAxis
                                type="category"
                                dataKey="label"
                                width={140}
                                tick={{ fontSize: 12, fill: CHART_COLORS.ivory }}
                            />
                        </>
                    ) : (
                        <>
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
                            <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
                        </>
                    )}
                    <Tooltip
                        contentStyle={{ background: '#FBF7F0', border: '1px solid #E0CDA6', fontSize: 13 }}
                    />
                    <Bar
                        dataKey={dataKey}
                        name={name}
                        fill={CHART_COLORS.brass}
                        radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
}

function useInsight(endpoint, groupBy) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios
            .get(route(`admin.insight.${endpoint}`), { params: groupBy ? { groupBy } : {} })
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.message ?? 'Failed to load.'))
            .finally(() => setLoading(false));
    }, [endpoint, groupBy]);

    return { data, error, loading };
}

export default function InsightIndex() {
    const [groupBy, setGroupBy] = useState('day');
    const overview = useInsight('overview', groupBy);
    const visitors = useInsight('visitors', groupBy);
    const behavior = useInsight('behavior');
    const search = useInsight('search', groupBy);
    const products = useInsight('products', groupBy);
    const ga4 = useInsight('ga4');

    return (
        <AdminLayout>
            <Head title="Admin · Insight" />

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

            <Section title="User Insight" loading={overview.loading} error={overview.error}>
                {overview.data && (
                    <>
                        <InsightLineChart
                            data={overview.data.timeseries}
                            series={[
                                { key: 'newUsers', name: 'New Users', color: 'brass' },
                                { key: 'logins', name: 'Logins', color: 'clay' },
                            ]}
                        />
                        <div className="border border-line max-w-2xl mt-4">
                            <StatRow label="Total Users" value={overview.data.totalUsers} />
                            <StatRow label="New Users Today" value={overview.data.newUsersToday} />
                            <StatRow label="Active Today" value={overview.data.activeToday} />
                            <StatRow label="Active This Month" value={overview.data.activeThisMonth} />
                            <StatRow
                                label="User Online Sekarang"
                                value={overview.data.onlineNow}
                                note={`within ${overview.data.onlineWindowMinutes} min`}
                            />
                            <StatRow label="Total Logins" value={overview.data.totalLogins} />
                            <StatRow label="Logins Today" value={overview.data.loginsToday} />
                            <StatRow label="Returning Users" value={overview.data.returningUsers} />
                        </div>
                    </>
                )}
            </Section>

            <Section title="Visitor Insight" loading={visitors.loading} error={visitors.error}>
                {visitors.data && (
                    <>
                        <InsightLineChart
                            data={visitors.data.timeseries}
                            series={[
                                { key: 'pageViews', name: 'Page Views', color: 'brass' },
                                { key: 'sessions', name: 'Sessions', color: 'clay' },
                            ]}
                        />
                        <div className="border border-line max-w-2xl mt-4">
                            <StatRow label="Unique Visitors" value={visitors.data.uniqueVisitors} />
                            <StatRow label="Page Views" value={visitors.data.pageViews} />
                            <StatRow label="Sessions" value={visitors.data.sessions} />
                            <StatRow label="Bounce Rate" value={`${visitors.data.bounceRate}%`} />
                            <StatRow
                                label="Avg. Session Duration"
                                value={formatDuration(visitors.data.avgSessionDurationSeconds)}
                            />
                            <StatRow
                                label="Device Breakdown"
                                value={Object.entries(visitors.data.devices)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' · ') || '—'}
                            />
                        </div>
                    </>
                )}
            </Section>

            <Section title="Product Insight" loading={products.loading} error={products.error}>
                {products.data && (
                    <>
                        <InsightLineChart
                            data={products.data.timeseries}
                            series={[
                                { key: 'views', name: 'Views', color: 'brass' },
                                { key: 'waClicks', name: 'WA Clicks', color: 'clay' },
                                { key: 'shares', name: 'Shares', color: 'brassdim' },
                            ]}
                        />
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted mb-2">Product Paling Dilihat</p>
                                <InsightBarChart
                                    data={products.data.topViewed.map((p) => ({
                                        label: p.product?.name ?? 'Deleted product',
                                        count: p.count,
                                    }))}
                                    dataKey="count"
                                    name="Views"
                                    horizontal
                                />
                            </div>
                            <div>
                                <p className="text-sm text-muted mb-2">Product Paling Diwishlist</p>
                                <InsightBarChart
                                    data={products.data.topWishlisted.map((p) => ({
                                        label: p.product?.name ?? 'Deleted product',
                                        count: p.count,
                                    }))}
                                    dataKey="count"
                                    name="Wishlists"
                                    horizontal
                                />
                            </div>
                        </div>
                        <div className="border border-line max-w-2xl mt-4">
                            <StatRow label="Total Views" value={products.data.totalViews} />
                            <StatRow label="Total WhatsApp Clicks" value={products.data.totalWaClicks} />
                            <StatRow label="Total Shares" value={products.data.totalShares} />
                            <StatRow label="Conversion Rate" value={`${products.data.conversionRate}%`} />
                            <StatRow label="Repeat View" value={products.data.repeatViewCount} />
                        </div>
                    </>
                )}
            </Section>

            <Section title="Customer Behavior Insight" loading={behavior.loading} error={behavior.error}>
                {behavior.data && (
                    <>
                        <InsightBarChart
                            data={behavior.data.peakHours.map((h) => ({
                                label: `${h.hour}:00`,
                                count: h.count,
                            }))}
                            dataKey="count"
                            name="Page Views"
                        />
                        <div className="border border-line max-w-2xl mt-4">
                            <StatRow
                                label="Busiest Hour"
                                value={
                                    behavior.data.peakHours.length
                                        ? `${
                                              behavior.data.peakHours.reduce((a, b) =>
                                                  b.count > a.count ? b : a
                                              ).hour
                                          }:00`
                                        : '—'
                                }
                            />
                            <StatRow label="New Visitors" value={behavior.data.newVisitors} />
                            <StatRow label="Returning Visitors" value={behavior.data.returningVisitors} />
                        </div>
                    </>
                )}
            </Section>

            <Section title="Search Insight" loading={search.loading} error={search.error}>
                {search.data && (
                    <>
                        <InsightLineChart
                            data={search.data.timeseries}
                            series={[{ key: 'count', name: 'Pencarian', color: 'brass' }]}
                        />
                        <div className="mt-4">
                            <p className="text-sm text-muted mb-2">Top Keywords</p>
                            <InsightBarChart
                                data={search.data.topKeywords.map((k) => ({
                                    label: k.query,
                                    count: k.count,
                                }))}
                                dataKey="count"
                                name="Searches"
                                horizontal
                            />
                        </div>
                        {search.data.zeroResultKeywords.length > 0 && (
                            <div className="border border-line max-w-2xl mt-4">
                                <div className="border-b border-line p-3 bg-surface text-sm text-muted">
                                    Keyword Tanpa Hasil
                                </div>
                                {search.data.zeroResultKeywords.map((k) => (
                                    <StatRow key={k.query} label={k.query} value={k.count} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Section>

            <Section title={`Google Analytics${ga4.data ? ` (${ga4.data.dateRange})` : ''}`} loading={ga4.loading}>
                {ga4.error ? (
                    <p className="text-muted text-sm">{ga4.error}</p>
                ) : ga4.data ? (
                    <>
                        <div className="border border-line max-w-2xl">
                            <StatRow label="Active Users" value={ga4.data.activeUsers} />
                            <StatRow label="Sessions" value={ga4.data.sessions} />
                            <StatRow label="Page Views" value={ga4.data.pageViews} />
                            <StatRow
                                label="Avg. Session Duration"
                                value={formatDuration(ga4.data.avgSessionDurationSeconds)}
                            />
                            <StatRow label="Bounce Rate" value={`${ga4.data.bounceRate}%`} />
                        </div>
                        <p className="text-xs text-muted mt-3">
                            Google Analytics data may be delayed by a few hours.
                        </p>
                    </>
                ) : null}
            </Section>
        </AdminLayout>
    );
}
