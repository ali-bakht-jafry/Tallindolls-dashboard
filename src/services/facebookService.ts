// ============================================================
// Agentic Dashboard — Facebook Ads Mock Data Service
// ============================================================

import { delay } from "@/lib/utils";
import type { FacebookCampaign, FacebookAdSummary } from "@/types";

function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return decimals > 0
    ? Math.round(val * 10 ** decimals) / 10 ** decimals
    : Math.round(val);
}

// ---------------------------------------------------------------------------
// Facebook Campaigns (8 campaigns)
// ---------------------------------------------------------------------------

const campaigns: FacebookCampaign[] = [
  {
    id: "fb-camp-001",
    name: "Summer Collection Launch",
    spend: 12400,
    impressions: 485000,
    clicks: 12450,
    ctr: 2.57,
    cpc: 1.0,
    cpm: 25.57,
    purchases: 420,
    roas: 7.42,
    status: "active",
  },
  {
    id: "fb-camp-002",
    name: "Linen Dress Retargeting",
    spend: 8200,
    impressions: 210000,
    clicks: 8200,
    ctr: 3.9,
    cpc: 1.0,
    cpm: 39.05,
    purchases: 360,
    roas: 8.95,
    status: "active",
  },
  {
    id: "fb-camp-003",
    name: "Boho Spirit Lookalike",
    spend: 6100,
    impressions: 340000,
    clicks: 6800,
    ctr: 2.0,
    cpm: 17.94,
    cpc: 0.9,
    purchases: 190,
    roas: 4.2,
    status: "paused",
  },
  {
    id: "fb-camp-004",
    name: "Evening Bloom — New Arrivals",
    spend: 9500,
    impressions: 390000,
    clicks: 9800,
    ctr: 2.51,
    cpm: 24.36,
    cpc: 0.97,
    purchases: 310,
    roas: 5.8,
    status: "active",
  },
  {
    id: "fb-camp-005",
    name: "Classic Core — Evergreen",
    spend: 4500,
    impressions: 275000,
    clicks: 4800,
    ctr: 1.75,
    cpm: 16.36,
    cpc: 0.94,
    purchases: 210,
    roas: 6.9,
    status: "active",
  },
  {
    id: "fb-camp-006",
    name: "Eco Essence Awareness",
    spend: 3200,
    impressions: 520000,
    clicks: 3400,
    ctr: 0.65,
    cpm: 6.15,
    cpc: 0.94,
    purchases: 68,
    roas: 3.1,
    status: "active",
  },
  {
    id: "fb-camp-007",
    name: "Spring Clearance — Bold Statement",
    spend: 2800,
    impressions: 180000,
    clicks: 3600,
    ctr: 2.0,
    cpm: 15.56,
    cpc: 0.78,
    purchases: 140,
    roas: 5.4,
    status: "completed",
  },
  {
    id: "fb-camp-008",
    name: "TikTok Crossover — Urban Edge",
    spend: 5500,
    impressions: 420000,
    clicks: 7200,
    ctr: 1.71,
    cpm: 13.1,
    cpc: 0.76,
    purchases: 180,
    roas: 4.5,
    status: "paused",
  },
];

// ---------------------------------------------------------------------------
// getFacebookCampaigns
// ---------------------------------------------------------------------------

export async function getFacebookCampaigns(): Promise<FacebookCampaign[]> {
  await delay(randomBetween(350, 650));
  return campaigns;
}

// ---------------------------------------------------------------------------
// getFacebookMetrics — aggregated summary
// ---------------------------------------------------------------------------

export async function getFacebookMetrics(): Promise<FacebookAdSummary> {
  await delay(randomBetween(300, 550));

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalPurchases = campaigns.reduce((s, c) => s + c.purchases, 0);

  // weighted-average CTR
  const averageCTR =
    Math.round(((totalClicks / totalImpressions) * 100) * 100) / 100;

  // average CPC
  const averageCPC =
    Math.round((totalSpend / totalClicks) * 100) / 100;

  // blended ROAS = total revenue attribution / total spend
  // Sum campaign-level "revenue" = spend * roas
  const estimatedRevenue = campaigns.reduce((s, c) => s + c.spend * c.roas, 0);
  const blendedROAS =
    Math.round((estimatedRevenue / totalSpend) * 100) / 100;

  const activeCount = campaigns.filter((c) => c.status === "active").length;

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalPurchases,
    averageCTR,
    averageCPC,
    blendedROAS,
    campaignCount: campaigns.length,
    activeCount,
  };
}
