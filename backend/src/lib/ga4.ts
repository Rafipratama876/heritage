import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Credentials come from the service account JSON key you downloaded —
// don't paste the whole file in; just its client_email and private_key
// fields, as separate env vars (see backend/.env.example). The private
// key's newlines get escaped as literal "\n" when stored in a .env file,
// so they're unescaped back to real newlines here.
const propertyId = process.env.GA_PROPERTY_ID;
const clientEmail = process.env.GA_CLIENT_EMAIL;
const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isGa4Configured = Boolean(propertyId && clientEmail && privateKey);

let client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (!isGa4Configured) {
    throw new Error(
      "Google Analytics isn't configured — set GA_PROPERTY_ID, GA_CLIENT_EMAIL, and GA_PRIVATE_KEY."
    );
  }
  if (!client) {
    client = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  }
  return client;
}

// Default reporting window — GA4's standard reports have a processing
// delay of a few hours, so "today" is often incomplete. Last 7 days is
// a more reliable default for a simple dashboard summary.
const DATE_RANGE = { startDate: "7daysAgo", endDate: "today" };

export async function fetchGa4Overview() {
  const analyticsDataClient = getClient();
  const property = `properties/${propertyId}`;

  const [summary] = await analyticsDataClient.runReport({
    property,
    dateRanges: [DATE_RANGE],
    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  });

  const [deviceReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [DATE_RANGE],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "activeUsers" }],
  });

  const [countryReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [DATE_RANGE],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 5,
  });

  const values = summary.rows?.[0]?.metricValues?.map((v) => v.value ?? "0") ?? [
    "0",
    "0",
    "0",
    "0",
    "0",
  ];

  const devices: Record<string, number> = {};
  for (const row of deviceReport.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value ?? "unknown";
    devices[name] = Number(row.metricValues?.[0]?.value ?? 0);
  }

  const topCountries = (countryReport.rows ?? []).map((row) => ({
    country: row.dimensionValues?.[0]?.value ?? "Unknown",
    activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  return {
    activeUsers: Number(values[0]),
    sessions: Number(values[1]),
    pageViews: Number(values[2]),
    avgSessionDurationSeconds: Math.round(Number(values[3])),
    bounceRate: Math.round(Number(values[4]) * 100), // GA4 returns a 0–1 fraction
    devices,
    topCountries,
    dateRange: "Last 7 days",
  };
}
