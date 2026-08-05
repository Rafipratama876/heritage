"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { InsightGroupBy } from "@/lib/api";

// Chart colors pulled from tailwind.config.ts — recharts needs literal
// color values, it can't read Tailwind utility classes.
export const CHART_COLORS = {
  brass: "#B8863F",
  clay: "#96432E",
  brassdim: "#8E6E38",
  ivory: "#3A2A18",
  muted: "#8A7357",
  line: "#E0CDA6",
};

const GROUP_BY_OPTIONS: { value: InsightGroupBy; label: string }[] = [
  { value: "day", label: "Per Hari" },
  { value: "week", label: "Per Minggu" },
  { value: "month", label: "Per Bulan" },
];

export function GroupByFilter({
  value,
  onChange,
}: {
  value: InsightGroupBy;
  onChange: (value: InsightGroupBy) => void;
}) {
  return (
    <div className="inline-flex border border-line">
      {GROUP_BY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm transition-colors ${
            value === opt.value
              ? "bg-brass text-canvas"
              : "text-ivory/80 hover:bg-surface"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function formatBucketLabel(bucket: string, groupBy: InsightGroupBy): string {
  const d = new Date(`${bucket}T00:00:00`);
  if (Number.isNaN(d.getTime())) return bucket;
  if (groupBy === "month") {
    return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function InsightLineChart<T extends { bucket: string }>({
  data,
  groupBy,
  series,
}: {
  data: T[];
  groupBy: InsightGroupBy;
  series: { key: keyof T & string; label: string; color: string }[];
}) {
  const chartData = data.map((d) => ({ ...d, label: formatBucketLabel(d.bucket, groupBy) }));

  return (
    <div className="border border-line p-4 h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.line} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
          <Tooltip
            contentStyle={{ background: "#FBF7F0", border: `1px solid ${CHART_COLORS.line}`, fontSize: 13 }}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InsightBarChart({
  data,
  xKey,
  yKey,
  color = CHART_COLORS.brass,
  horizontal = false,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  horizontal?: boolean;
}) {
  if (!data.length) {
    return (
      <div className="border border-line p-4 h-64 flex items-center justify-center">
        <p className="text-muted text-sm">Belum ada data</p>
      </div>
    );
  }

  return (
    <div className="border border-line p-4" style={{ height: Math.max(220, data.length * 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 16, left: horizontal ? 8 : -16, bottom: 0 }}
        >
          <CartesianGrid stroke={CHART_COLORS.line} strokeDasharray="3 3" />
          {horizontal ? (
            <>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
              <YAxis
                type="category"
                dataKey={xKey}
                width={140}
                tick={{ fontSize: 12, fill: CHART_COLORS.ivory }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} />
            </>
          )}
          <Tooltip
            contentStyle={{ background: "#FBF7F0", border: `1px solid ${CHART_COLORS.line}`, fontSize: 13 }}
          />
          <Bar dataKey={yKey} fill={color} radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
