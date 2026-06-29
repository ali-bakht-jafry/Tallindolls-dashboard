// ============================================================
// Agentic Dashboard — Agent Actions Mock Data Service
// ============================================================

import { delay } from "@/lib/utils";
import type { AgentAction, AgentMetrics, ScheduledPost } from "@/types";

function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return decimals > 0
    ? Math.round(val * 10 ** decimals) / 10 ** decimals
    : Math.round(val);
}

// ---------------------------------------------------------------------------
// Agent Actions — 10 items
// ---------------------------------------------------------------------------

const actions: AgentAction[] = [
  {
    id: "act-001",
    agentType: "optimizer",
    title: "Campaign Budget Optimizer ran",
    description: "Reallocated €3,200 from underperforming Boho Spirit Lookalike campaign to Instagram Summer Collection, improving blended ROAS by 0.4x.",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    metrics: [
      { label: "Budget Shifted", value: "€3,200" },
      { label: "ROAS Improvement", value: "+0.4x" },
    ],
  },
  {
    id: "act-002",
    agentType: "inventory",
    title: "Restock Planner analyzed inventory",
    description: "Scanned 200 SKUs across 10 collections. Identified 7 critical stockout risks and generated purchase orders for 38 items totaling €42,800.",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    metrics: [
      { label: "SKUs Analyzed", value: "200" },
      { label: "POs Generated", value: "38" },
      { label: "Total PO Value", value: "€42,800" },
    ],
  },
  {
    id: "act-003",
    agentType: "post",
    title: "Content Generator created 3 posts",
    description: "Generated Instagram carousel, Facebook video snippet, and TikTok short featuring the new Linen Luxe collection with optimized hashtags.",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    metrics: [
      { label: "Posts Created", value: "3" },
      { label: "Platforms", value: "IG, FB, TT" },
      { label: "Est. Reach", value: "48K" },
    ],
  },
  {
    id: "act-004",
    agentType: "ad",
    title: "Performance Ad Creative A/B test launched",
    description: "Launched 4 creative variants for the Coastal Linen Trouser campaign across Facebook and Instagram, testing lifestyle vs. studio imagery.",
    status: "running",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    metrics: [
      { label: "Variants", value: "4" },
      { label: "Budget per Variant", value: "€500" },
      { label: "Duration", value: "7 days" },
    ],
  },
  {
    id: "act-005",
    agentType: "optimizer",
    title: "Bid Strategy Adjuster updated bids",
    description: "Lowered CPC bids by 12% on underperforming audiences and increased by 8% on top-converting segments based on last 14 days of data.",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 15).toISOString(),
    metrics: [
      { label: "CPC Reduction", value: "-12%" },
      { label: "Affected Campaigns", value: "5" },
    ],
  },
  {
    id: "act-006",
    agentType: "inventory",
    title: "Demand Forecaster updated projections",
    description: "Recalculated 30/60/90 day demand forecasts for all collections using updated sales velocity data and seasonal multipliers.",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    metrics: [
      { label: "Forecasts Updated", value: "200" },
      { label: "Confidence Score", value: "87%" },
    ],
  },
  {
    id: "act-007",
    agentType: "post",
    title: "Social Media Scheduler queued next week",
    description: "Scheduled 7 posts across Instagram, Facebook, and TikTok for the upcoming week, covering Summer Breeze, Evening Bloom, and Eco Essence.",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    metrics: [
      { label: "Posts Scheduled", value: "7" },
      { label: "Best Time Slots", value: "6PM-9PM" },
    ],
  },
  {
    id: "act-008",
    agentType: "ad",
    title: "Retargeting Audience Refresh in progress",
    description: "Syncing latest Klaviyo and GA4 audiences to Facebook Custom Audiences. Updating exclusion lists for recent purchasers.",
    status: "running",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    metrics: [
      { label: "Audiences Syncing", value: "8" },
      { label: "Est. Audience Size", value: "124K" },
    ],
  },
  {
    id: "act-009",
    agentType: "optimizer",
    title: "Weekly Performance Report generated",
    description: "Compiled cross-channel performance report: top channel Instagram (€72K, 6.9x ROAS), top product Linen Wrap Dress (€12K revenue).",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    metrics: [
      { label: "Report Sections", value: "8" },
      { label: "Insights Generated", value: "12" },
    ],
  },
  {
    id: "act-010",
    agentType: "inventory",
    title: "Slow-Moving Stock Alert triggered",
    description: "Identified 23 items across Bold Statement, Urban Edge, and Classic Core with velocity below 0.8 units/day. Flagged for markdown review.",
    status: "pending",
    timestamp: new Date().toISOString(),
    metrics: [
      { label: "Items Flagged", value: "23" },
      { label: "Total Stock Value", value: "€38,500" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Agent Metrics
// ---------------------------------------------------------------------------

const agentMetrics: AgentMetrics = {
  totalActions: 247,
  adsCreated: 89,
  postsScheduled: 52,
  budgetSaved: 28400,
};

// ---------------------------------------------------------------------------
// Scheduled Posts — 7 items
// ---------------------------------------------------------------------------

const posts: ScheduledPost[] = [
  {
    id: "post-001",
    title: "Summer Breeze Collection — Behind the Design",
    content: "From sketch to stitch. Discover how our Summer Breeze Midi Dress came to life in our Tallinn atelier. 🌿✨ Tap the link in bio to read the full story. #TallinnDoll #SummerBreeze #BehindTheDesign",
    platform: "Instagram",
    scheduledDate: "2026-07-01T18:00:00Z",
    status: "scheduled",
    productRef: "SB-DR-001",
  },
  {
    id: "post-002",
    title: "Linen Luxe Lookbook — Coastal Editorial",
    content: "Effortless elegance meets coastal charm. Our new Linen Luxe lookbook is live. Shop the full collection at tallinndoll.com 🌊 #LinenLuxe #CoastalStyle",
    platform: "Instagram",
    scheduledDate: "2026-07-02T12:00:00Z",
    status: "scheduled",
    productRef: "LN-DR-001",
  },
  {
    id: "post-003",
    title: "Customer Love — Classic Silk Blouse Reviews",
    content: "\"The perfect blouse for every occasion.\" — Maria K. See what our customers are saying about the Classic Silk Blouse. ⭐ 4.9/5 from 340+ reviews. Shop now.",
    platform: "Facebook",
    scheduledDate: "2026-07-03T14:00:00Z",
    status: "scheduled",
    productRef: "CC-TP-001",
  },
  {
    id: "post-004",
    title: "Eco Essence — Why We Choose Organic",
    content: "Sustainability isn't a trend — it's our commitment. Learn why 100% of our Eco Essence collection uses GOTS-certified organic cotton and recycled materials. 🌍💚 #EcoEssence #SustainableFashion",
    platform: "Instagram",
    scheduledDate: "2026-07-04T09:00:00Z",
    status: "draft",
    productRef: "EE-TP-001",
  },
  {
    id: "post-005",
    title: "Boho Spirit — Festival Styling Guide",
    content: "Festival season is here. 3 ways to style our Boho Embroidered Top for your next summer festival. Swipe for the looks. 🎪✨ #BohoSpirit #FestivalFashion",
    platform: "TikTok",
    scheduledDate: "2026-07-04T17:00:00Z",
    status: "scheduled",
    productRef: "BH-TP-003",
  },
  {
    id: "post-006",
    title: "Evening Bloom — Summer Wedding Edit",
    content: "RSVP ready. Our Evening Bloom collection has everything you need for wedding season. From cocktail dresses to evening gowns. Shop the edit now. 💍🌸 #EveningBloom #WeddingGuest",
    platform: "Facebook",
    scheduledDate: "2026-07-05T11:00:00Z",
    status: "scheduled",
    productRef: "EB-DR-003",
  },
  {
    id: "post-007",
    title: "Mid-Summer Sale Teaser",
    content: "Something exciting is coming... 👀 Our mid-summer sale drops July 10th. Sign up for early access via the link in our story. #TallinnDoll #SummerSale",
    platform: "Instagram",
    scheduledDate: "2026-07-08T16:00:00Z",
    status: "draft",
  },
];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

export async function getAgentActions(): Promise<AgentAction[]> {
  await delay(randomBetween(300, 600));
  return actions;
}

export async function getAgentMetrics(): Promise<AgentMetrics> {
  await delay(randomBetween(250, 450));
  return agentMetrics;
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  await delay(randomBetween(300, 550));
  return posts;
}
