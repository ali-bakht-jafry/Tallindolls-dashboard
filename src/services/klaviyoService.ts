// ============================================================
// Agentic Dashboard — Klaviyo Email Mock Data Service
// ============================================================

import { delay } from "@/lib/utils";
import type { KlaviyoMonthlyData } from "@/types";

function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return decimals > 0
    ? Math.round(val * 10 ** decimals) / 10 ** decimals
    : Math.round(val);
}

// ---------------------------------------------------------------------------
// 12-month Klaviyo data (2025-07 → 2026-06)
// ---------------------------------------------------------------------------

const klaviyoMonthly: KlaviyoMonthlyData[] = [
  {
    month: "2025-07",
    emailRevenue: 72300,
    campaignRevenue: 45200,
    flowRevenue: 27100,
    openRate: 36.4,
    clickRate: 8.2,
    subscribers: 48500,
    sends: 142000,
  },
  {
    month: "2025-08",
    emailRevenue: 78100,
    campaignRevenue: 48800,
    flowRevenue: 29300,
    openRate: 37.1,
    clickRate: 8.5,
    subscribers: 49200,
    sends: 150000,
  },
  {
    month: "2025-09",
    emailRevenue: 74500,
    campaignRevenue: 46200,
    flowRevenue: 28300,
    openRate: 35.8,
    clickRate: 8.0,
    subscribers: 50100,
    sends: 148000,
  },
  {
    month: "2025-10",
    emailRevenue: 81200,
    campaignRevenue: 51000,
    flowRevenue: 30200,
    openRate: 38.2,
    clickRate: 9.1,
    subscribers: 51100,
    sends: 162000,
  },
  {
    month: "2025-11",
    emailRevenue: 96800,
    campaignRevenue: 60200,
    flowRevenue: 36600,
    openRate: 40.1,
    clickRate: 10.3,
    subscribers: 52300,
    sends: 185000,
  },
  {
    month: "2025-12",
    emailRevenue: 112400,
    campaignRevenue: 69800,
    flowRevenue: 42600,
    openRate: 42.5,
    clickRate: 11.2,
    subscribers: 53800,
    sends: 210000,
  },
  {
    month: "2026-01",
    emailRevenue: 85400,
    campaignRevenue: 53200,
    flowRevenue: 32200,
    openRate: 39.0,
    clickRate: 9.5,
    subscribers: 54200,
    sends: 172000,
  },
  {
    month: "2026-02",
    emailRevenue: 78900,
    campaignRevenue: 49000,
    flowRevenue: 29900,
    openRate: 37.8,
    clickRate: 8.8,
    subscribers: 55000,
    sends: 158000,
  },
  {
    month: "2026-03",
    emailRevenue: 92100,
    campaignRevenue: 57500,
    flowRevenue: 34600,
    openRate: 40.6,
    clickRate: 10.0,
    subscribers: 56200,
    sends: 180000,
  },
  {
    month: "2026-04",
    emailRevenue: 88400,
    campaignRevenue: 55300,
    flowRevenue: 33100,
    openRate: 39.4,
    clickRate: 9.7,
    subscribers: 57400,
    sends: 176000,
  },
  {
    month: "2026-05",
    emailRevenue: 94500,
    campaignRevenue: 59000,
    flowRevenue: 35500,
    openRate: 41.2,
    clickRate: 10.6,
    subscribers: 58800,
    sends: 188000,
  },
  {
    month: "2026-06",
    emailRevenue: 98000,
    campaignRevenue: 61200,
    flowRevenue: 36800,
    openRate: 42.8,
    clickRate: 11.0,
    subscribers: 60200,
    sends: 196000,
  },
];

// ---------------------------------------------------------------------------
// getKlaviyoMetrics — aggregate summary
// ---------------------------------------------------------------------------

export async function getKlaviyoMetrics(): Promise<{
  totalEmailRevenue: number;
  totalCampaignRevenue: number;
  totalFlowRevenue: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalSubscribers: number;
  totalSends: number;
}> {
  await delay(randomBetween(300, 600));

  const latest = klaviyoMonthly[klaviyoMonthly.length - 1];

  const totalEmailRevenue = klaviyoMonthly.reduce((s, m) => s + m.emailRevenue, 0);
  const totalCampaignRevenue = klaviyoMonthly.reduce((s, m) => s + m.campaignRevenue, 0);
  const totalFlowRevenue = klaviyoMonthly.reduce((s, m) => s + m.flowRevenue, 0);
  const avgOpenRate =
    Math.round(
      (klaviyoMonthly.reduce((s, m) => s + m.openRate, 0) / klaviyoMonthly.length) * 10,
    ) / 10;
  const avgClickRate =
    Math.round(
      (klaviyoMonthly.reduce((s, m) => s + m.clickRate, 0) / klaviyoMonthly.length) * 10,
    ) / 10;
  const totalSends = klaviyoMonthly.reduce((s, m) => s + m.sends, 0);

  return {
    totalEmailRevenue,
    totalCampaignRevenue,
    totalFlowRevenue,
    avgOpenRate,
    avgClickRate,
    totalSubscribers: latest.subscribers,
    totalSends,
  };
}

// ---------------------------------------------------------------------------
// getKlaviyoMonthlyData — full 12-month array
// ---------------------------------------------------------------------------

export async function getKlaviyoMonthlyData(): Promise<KlaviyoMonthlyData[]> {
  await delay(randomBetween(350, 650));
  return klaviyoMonthly;
}
