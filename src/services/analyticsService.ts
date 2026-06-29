// ============================================================
// Agentic Dashboard — Google Analytics Mock Data Service
// ============================================================

import { delay } from "@/lib/utils";
import type { LandingPageMetrics, GAMonthlyData } from "@/types";

function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return decimals > 0
    ? Math.round(val * 10 ** decimals) / 10 ** decimals
    : Math.round(val);
}

// ---------------------------------------------------------------------------
// Landing pages
// ---------------------------------------------------------------------------

const landingPages: LandingPageMetrics[] = [
  { page: "/", sessions: 14200, conversions: 482 },
  { page: "/collections/summer-breeze", sessions: 8200, conversions: 295 },
  { page: "/products/linen-wrap-dress", sessions: 5400, conversions: 210 },
  { page: "/collections/evening-bloom", sessions: 4800, conversions: 163 },
  { page: "/products/classic-silk-blouse", sessions: 3900, conversions: 148 },
  { page: "/collections/linen-luxe", sessions: 4200, conversions: 138 },
  { page: "/products/boho-embroidered-top", sessions: 3700, conversions: 133 },
  { page: "/collections/boho-spirit", sessions: 3600, conversions: 126 },
];

// ---------------------------------------------------------------------------
// 12-month GA data (2025-07 → 2026-06)
// ---------------------------------------------------------------------------

const gaMonthly: GAMonthlyData[] = [
  {
    month: "2025-07",
    sessions: 41200,
    users: 28300,
    bounceRate: 42.1,
    avgSessionDuration: 128,
    conversionRate: 2.4,
    topLandingPages: [
      { page: "/", sessions: 11800, conversions: 283 },
      { page: "/collections/summer-breeze", sessions: 6200, conversions: 161 },
      { page: "/products/linen-wrap-dress", sessions: 3100, conversions: 102 },
    ],
  },
  {
    month: "2025-08",
    sessions: 43800,
    users: 30200,
    bounceRate: 41.5,
    avgSessionDuration: 132,
    conversionRate: 2.5,
    topLandingPages: [
      { page: "/", sessions: 12500, conversions: 313 },
      { page: "/collections/summer-breeze", sessions: 6800, conversions: 177 },
      { page: "/products/linen-wrap-dress", sessions: 3400, conversions: 112 },
    ],
  },
  {
    month: "2025-09",
    sessions: 42500,
    users: 29100,
    bounceRate: 43.0,
    avgSessionDuration: 125,
    conversionRate: 2.3,
    topLandingPages: [
      { page: "/", sessions: 12000, conversions: 276 },
      { page: "/collections/evening-bloom", sessions: 5900, conversions: 148 },
      { page: "/collections/linen-luxe", sessions: 4800, conversions: 129 },
    ],
  },
  {
    month: "2025-10",
    sessions: 44800,
    users: 31100,
    bounceRate: 40.8,
    avgSessionDuration: 135,
    conversionRate: 2.6,
    topLandingPages: [
      { page: "/", sessions: 12800, conversions: 333 },
      { page: "/collections/coastal-charm", sessions: 5400, conversions: 151 },
      { page: "/products/classic-silk-blouse", sessions: 3600, conversions: 126 },
    ],
  },
  {
    month: "2025-11",
    sessions: 47800,
    users: 33500,
    bounceRate: 39.2,
    avgSessionDuration: 141,
    conversionRate: 2.8,
    topLandingPages: [
      { page: "/", sessions: 13600, conversions: 381 },
      { page: "/collections/boho-spirit", sessions: 6100, conversions: 183 },
      { page: "/products/boho-embroidered-top", sessions: 3200, conversions: 122 },
    ],
  },
  {
    month: "2025-12",
    sessions: 52100,
    users: 36800,
    bounceRate: 37.5,
    avgSessionDuration: 150,
    conversionRate: 3.1,
    topLandingPages: [
      { page: "/", sessions: 14800, conversions: 459 },
      { page: "/collections/evening-bloom", sessions: 7200, conversions: 230 },
      { page: "/products/linen-wrap-dress", sessions: 4100, conversions: 148 },
    ],
  },
  {
    month: "2026-01",
    sessions: 46200,
    users: 31800,
    bounceRate: 41.0,
    avgSessionDuration: 130,
    conversionRate: 2.6,
    topLandingPages: [
      { page: "/", sessions: 13200, conversions: 343 },
      { page: "/collections/classic-core", sessions: 5500, conversions: 154 },
      { page: "/collections/minimal-muse", sessions: 4200, conversions: 126 },
    ],
  },
  {
    month: "2026-02",
    sessions: 44500,
    users: 30500,
    bounceRate: 41.8,
    avgSessionDuration: 127,
    conversionRate: 2.5,
    topLandingPages: [
      { page: "/", sessions: 12800, conversions: 320 },
      { page: "/collections/urban-edge", sessions: 5100, conversions: 133 },
      { page: "/collections/eco-essence", sessions: 4000, conversions: 108 },
    ],
  },
  {
    month: "2026-03",
    sessions: 48300,
    users: 33800,
    bounceRate: 40.2,
    avgSessionDuration: 133,
    conversionRate: 2.7,
    topLandingPages: [
      { page: "/", sessions: 13800, conversions: 373 },
      { page: "/collections/bold-statement", sessions: 5600, conversions: 162 },
      { page: "/collections/linen-luxe", sessions: 4600, conversions: 133 },
    ],
  },
  {
    month: "2026-04",
    sessions: 49800,
    users: 35100,
    bounceRate: 39.5,
    avgSessionDuration: 138,
    conversionRate: 2.9,
    topLandingPages: [
      { page: "/", sessions: 14100, conversions: 409 },
      { page: "/collections/summer-breeze", sessions: 7000, conversions: 210 },
      { page: "/products/coastal-linen-trouser", sessions: 3400, conversions: 119 },
    ],
  },
  {
    month: "2026-05",
    sessions: 51000,
    users: 36200,
    bounceRate: 38.8,
    avgSessionDuration: 144,
    conversionRate: 3.0,
    topLandingPages: [
      { page: "/", sessions: 14500, conversions: 435 },
      { page: "/collections/summer-breeze", sessions: 7600, conversions: 236 },
      { page: "/products/linen-wrap-dress", sessions: 4800, conversions: 178 },
    ],
  },
  {
    month: "2026-06",
    sessions: 52400,
    users: 37400,
    bounceRate: 38.1,
    avgSessionDuration: 148,
    conversionRate: 3.2,
    topLandingPages: landingPages.slice(0, 3),
  },
];

// ---------------------------------------------------------------------------
// getGoogleAnalyticsMetrics
// ---------------------------------------------------------------------------

export async function getGoogleAnalyticsMetrics(): Promise<{
  totalSessions: number;
  totalUsers: number;
  avgBounceRate: number;
  avgSessionDuration: number;
  avgConversionRate: number;
}> {
  await delay(randomBetween(300, 600));

  const latest = gaMonthly[gaMonthly.length - 1];
  const totalSessions = gaMonthly.reduce((s, m) => s + m.sessions, 0);
  const totalUsers = gaMonthly.reduce((s, m) => s + m.users, 0);
  const avgBounceRate =
    Math.round(
      (gaMonthly.reduce((s, m) => s + m.bounceRate, 0) / gaMonthly.length) * 10,
    ) / 10;
  const avgSessionDuration = Math.round(
    gaMonthly.reduce((s, m) => s + m.avgSessionDuration, 0) / gaMonthly.length,
  );
  const avgConversionRate =
    Math.round(
      (gaMonthly.reduce((s, m) => s + m.conversionRate, 0) / gaMonthly.length) * 10,
    ) / 10;

  return {
    totalSessions,
    totalUsers,
    avgBounceRate,
    avgSessionDuration,
    avgConversionRate,
  };
}

// ---------------------------------------------------------------------------
// getTopLandingPages
// ---------------------------------------------------------------------------

export async function getTopLandingPages(): Promise<LandingPageMetrics[]> {
  await delay(randomBetween(300, 550));
  return landingPages;
}

// ---------------------------------------------------------------------------
// getTrafficOverview — full 12-month GA array
// ---------------------------------------------------------------------------

export async function getTrafficOverview(): Promise<GAMonthlyData[]> {
  await delay(randomBetween(350, 650));
  return gaMonthly;
}
