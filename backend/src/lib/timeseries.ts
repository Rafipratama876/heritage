// Shared helpers for building day/week/month time-series charts on the
// admin insight page. All buckets are labelled by their period's start
// date ("YYYY-MM-DD") so labels sort chronologically and line up between
// the SQL bucket expression and the JS-generated bucket list below.

export type GroupBy = "day" | "week" | "month";

export function parseGroupBy(value: unknown): GroupBy {
  return value === "week" || value === "month" ? value : "day";
}

const PERIODS: Record<GroupBy, number> = { day: 30, week: 12, month: 12 };

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function startOfWeek(d: Date): Date {
  const r = startOfDay(d);
  const dayIndex = (r.getDay() + 6) % 7; // 0 = Monday
  r.setDate(r.getDate() - dayIndex);
  return r;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// The earliest bucket's start date — used as the SQL range's lower bound.
export function rangeStart(groupBy: GroupBy): Date {
  const now = new Date();
  const periods = PERIODS[groupBy];
  if (groupBy === "day") {
    const d = startOfDay(now);
    d.setDate(d.getDate() - (periods - 1));
    return d;
  }
  if (groupBy === "week") {
    const d = startOfWeek(now);
    d.setDate(d.getDate() - (periods - 1) * 7);
    return d;
  }
  const d = startOfMonth(now);
  d.setMonth(d.getMonth() - (periods - 1));
  return d;
}

// Every bucket label expected in the range, oldest first, so charts show
// a continuous axis even for buckets with zero events.
export function generateBuckets(groupBy: GroupBy): string[] {
  const now = new Date();
  const periods = PERIODS[groupBy];
  const buckets: string[] = [];
  if (groupBy === "day") {
    const start = startOfDay(now);
    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(d.getDate() - i);
      buckets.push(fmt(d));
    }
  } else if (groupBy === "week") {
    const start = startOfWeek(now);
    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(d.getDate() - i * 7);
      buckets.push(fmt(d));
    }
  } else {
    const start = startOfMonth(now);
    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date(start.getFullYear(), start.getMonth() - i, 1);
      buckets.push(fmt(d));
    }
  }
  return buckets;
}

// Raw-SQL bucket expression for a given `createdAt`-like column, matching
// the label format generateBuckets() produces (MySQL syntax).
export function bucketExpr(column: string, groupBy: GroupBy): string {
  if (groupBy === "day") return `DATE_FORMAT(${column}, '%Y-%m-%d')`;
  if (groupBy === "week") {
    return `DATE_FORMAT(DATE_SUB(${column}, INTERVAL WEEKDAY(${column}) DAY), '%Y-%m-%d')`;
  }
  return `DATE_FORMAT(${column}, '%Y-%m-01')`;
}

// Merges sparse per-bucket counts from the DB onto the full bucket list,
// defaulting missing periods to `zero`.
export function fillBuckets<T extends Record<string, number>>(
  buckets: string[],
  rowsByBucket: Map<string, T>,
  zero: T
): (T & { bucket: string })[] {
  return buckets.map((bucket) => ({ bucket, ...(rowsByBucket.get(bucket) ?? zero) }));
}
