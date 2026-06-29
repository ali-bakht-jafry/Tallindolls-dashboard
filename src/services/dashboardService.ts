// ============================================================
// Agentic Dashboard — Dashboard Mock Data Service
// ============================================================

import { delay } from "@/lib/utils";
import type {
  KPI,
  TimeSeriesEntry,
  TimeSeriesData,
  TimeFrame,
  ChannelData,
  Notification,
  MonthlyReport,
} from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return decimals > 0
    ? Math.round(val * 10 ** decimals) / 10 ** decimals
    : Math.round(val);
}

/** Build a daily date array going back `days` from a given end-date. */
function dailyDates(days: number, endDate = "2026-06-29"): string[] {
  const dates: string[] = [];
  const end = new Date(endDate);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function monthlyDates(count: number, endYear = 2026, endMonth = 6): string[] {
  const dates: string[] = [];
  let y = endYear;
  let m = endMonth;
  for (let i = count - 1; i >= 0; i--) {
    const label = `${y}-${String(m).padStart(2, "0")}-01`;
    dates.push(label);
    m--;
    if (m === 0) {
      m = 12;
      y--;
    }
  }
  return dates;
}

// ---------------------------------------------------------------------------
// KPI Sparklines (30-point arrays — seed-based so they're deterministic-ish)
// ---------------------------------------------------------------------------

const revenueSparkline = [
  7200, 7450, 7100, 7680, 7820, 7590, 8010, 8150, 7920, 8230, 8380, 8120,
  8470, 8610, 8340, 8690, 8820, 8560, 8910, 9050, 8780, 9120, 9260, 8990,
  9340, 9480, 9210, 9570, 9710, 9440,
];

const ordersSparkline = [
  116, 121, 114, 124, 126, 119, 131, 135, 128, 136, 139, 132, 140, 143, 137,
  145, 148, 141, 150, 153, 146, 155, 158, 151, 160, 163, 156, 165, 169, 161,
];

const spendSparkline = [
  4100, 4180, 4050, 4220, 4280, 4140, 4320, 4380, 4240, 4420, 4480, 4340,
  4520, 4580, 4440, 4620, 4680, 4540, 4720, 4780, 4640, 4820, 4880, 4740,
  4920, 4980, 4840, 5020, 5080, 4940,
];

const roasSparkline = [
  6.2, 6.5, 6.1, 6.6, 6.7, 6.4, 6.8, 6.9, 6.5, 7.0, 7.1, 6.7, 7.2, 7.3, 6.9,
  7.4, 7.5, 7.1, 7.6, 7.7, 7.3, 7.8, 7.9, 7.5, 8.0, 8.1, 7.7, 8.2, 8.3, 7.9,
];

const sessionsSparkline = [
  1540, 1590, 1480, 1630, 1670, 1550, 1720, 1760, 1620, 1800, 1840, 1690,
  1880, 1920, 1760, 1960, 2000, 1830, 2050, 2090, 1910, 2130, 2170, 1980,
  2210, 2250, 2050, 2290, 2330, 2120,
];

const cvrSparkline = [
  2.8, 2.9, 2.7, 3.0, 3.0, 2.8, 3.1, 3.1, 2.9, 3.2, 3.2, 3.0, 3.3, 3.3, 3.1,
  3.4, 3.4, 3.2, 3.5, 3.5, 3.3, 3.6, 3.6, 3.4, 3.7, 3.7, 3.5, 3.8, 3.8, 3.6,
];

const aovSparkline = [
  205, 208, 203, 211, 213, 207, 215, 217, 210, 219, 221, 214, 223, 225, 218,
  227, 229, 222, 231, 233, 226, 235, 237, 230, 239, 241, 234, 243, 245, 238,
];

const ltvSparkline = [
  1020, 1040, 1000, 1060, 1080, 1030, 1100, 1120, 1060, 1140, 1160, 1100,
  1180, 1200, 1140, 1220, 1240, 1180, 1260, 1280, 1220, 1300, 1320, 1260,
  1340, 1360, 1300, 1380, 1400, 1340,
];

const invSparkline = [
  345000, 344000, 346000, 343000, 342500, 344500, 341500, 342000, 343000,
  341000, 340500, 342000, 340000, 341000, 342500, 339500, 340000, 341500,
  338500, 339000, 340000, 337500, 338000, 339500, 336500, 337000, 338500,
  335500, 336000, 337500,
];

const returnSparkline = [
  5.2, 5.1, 5.3, 5.0, 4.9, 5.1, 4.8, 4.7, 4.9, 4.6, 4.5, 4.7, 4.4, 4.3, 4.5,
  4.2, 4.1, 4.3, 4.0, 3.9, 4.1, 3.8, 3.7, 3.9, 3.6, 3.5, 3.7, 3.4, 3.3, 3.5,
];

// ---------------------------------------------------------------------------
// 1. KPIs
// ---------------------------------------------------------------------------

export async function getKPIs(): Promise<KPI[]> {
  await delay(randomBetween(300, 700));

  const kpis: KPI[] = [
    {
      title: "Total Revenue",
      value: "€847,250",
      trend: 12.5,
      previousValue: "€753,100",
      sparkline: revenueSparkline,
      status: "positive",
    },
    {
      title: "Orders",
      value: "3,842",
      trend: 8.3,
      previousValue: "3,547",
      sparkline: ordersSparkline,
      status: "positive",
    },
    {
      title: "Marketing Spend",
      value: "€124,300",
      trend: -3.2,
      previousValue: "€128,410",
      sparkline: spendSparkline,
      status: "positive", // spending less is positive
    },
    {
      title: "ROAS",
      value: "6.82x",
      trend: 5.1,
      previousValue: "6.49x",
      sparkline: roasSparkline,
      status: "positive",
    },
    {
      title: "Sessions",
      value: "52,400",
      trend: 15.7,
      previousValue: "45,290",
      sparkline: sessionsSparkline,
      status: "positive",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      trend: 0.4,
      previousValue: "2.8%",
      sparkline: cvrSparkline,
      status: "positive",
    },
    {
      title: "Avg Order Value",
      value: "€220.50",
      trend: 2.1,
      previousValue: "€215.97",
      sparkline: aovSparkline,
      status: "positive",
    },
    {
      title: "Customer LTV",
      value: "€1,180",
      trend: 4.8,
      previousValue: "€1,126",
      sparkline: ltvSparkline,
      status: "positive",
    },
    {
      title: "Inventory Value",
      value: "€342,000",
      trend: -1.5,
      previousValue: "€347,200",
      sparkline: invSparkline,
      status: "negative",
    },
    {
      title: "Return Rate",
      value: "4.8%",
      trend: -0.6,
      previousValue: "5.4%",
      sparkline: returnSparkline,
      status: "positive", // lower return rate is good
    },
  ];

  return kpis;
}

// ---------------------------------------------------------------------------
// 2. Time Series
// ---------------------------------------------------------------------------

export async function getTimeSeriesData(timeframe: TimeFrame): Promise<TimeSeriesData> {
  await delay(randomBetween(350, 650));

  const dayMap: Record<TimeFrame, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "12m": 12,
  };

  const isMonthly = timeframe === "12m";
  const count = dayMap[timeframe];
  const dateLabels = isMonthly ? monthlyDates(count) : dailyDates(count);

  const entries: TimeSeriesEntry[] = dateLabels.map((date, i) => {
    // Generate realistic daily / monthly figures with slightly upward trend
    const base = 0.85 + (i / count) * 0.3; // 0.85 → 1.15 multiplier over the range
    const dayOfWeek = isMonthly ? 3 : new Date(date).getDay(); // mid-week for monthly

    const revenue = Math.round(base * (isMonthly ? 68000 : 2200) * (1 + (Math.random() - 0.5) * 0.18));
    const orders = Math.round(base * (isMonthly ? 310 : 10) * (1 + (Math.random() - 0.5) * 0.15));
    const marketingSpend = Math.round(base * (isMonthly ? 10200 : 340) * (1 + (Math.random() - 0.5) * 0.12));
    const roas = Math.round((revenue / Math.max(marketingSpend, 1)) * 100) / 100;
    const sessions = Math.round(base * (isMonthly ? 4200 : 140) * (1 + (Math.random() - 0.5) * 0.2));
    const conversionRate = Math.round(((orders / Math.max(sessions, 1)) * 100) * 100) / 100;

    return {
      date,
      revenue: Math.max(revenue, isMonthly ? 50000 : 1500),
      orders: Math.max(orders, isMonthly ? 200 : 5),
      marketingSpend: Math.max(marketingSpend, isMonthly ? 7000 : 200),
      roas: Math.max(roas, 1),
      sessions: Math.max(sessions, isMonthly ? 2500 : 70),
      conversionRate: Math.min(Math.max(conversionRate, 1.5), 6),
    };
  });

  const totals = entries.reduce(
    (acc, e) => ({
      revenue: acc.revenue + e.revenue,
      orders: acc.orders + e.orders,
      marketingSpend: acc.marketingSpend + e.marketingSpend,
      sessions: acc.sessions + e.sessions,
    }),
    { revenue: 0, orders: 0, marketingSpend: 0, sessions: 0 },
  );

  const avgRoas =
    entries.reduce((sum, e) => sum + e.roas, 0) / entries.length;
  const avgCvr =
    entries.reduce((sum, e) => sum + e.conversionRate, 0) / entries.length;

  return {
    timeframe,
    dataPoints: entries,
    totals,
    averages: {
      roas: Math.round(avgRoas * 100) / 100,
      conversionRate: Math.round(avgCvr * 100) / 100,
    },
  };
}

// ---------------------------------------------------------------------------
// 3. Channel Breakdown
// ---------------------------------------------------------------------------

export async function getChannelData(): Promise<ChannelData[]> {
  await delay(randomBetween(300, 600));

  return [
    {
      channel: "Instagram",
      revenue: 289000,
      spend: 42000,
      roas: 6.88,
      orders: 1310,
    },
    {
      channel: "Facebook",
      revenue: 195000,
      spend: 35000,
      roas: 5.57,
      orders: 880,
    },
    {
      channel: "Google",
      revenue: 172000,
      spend: 28000,
      roas: 6.14,
      orders: 780,
    },
    {
      channel: "Email",
      revenue: 98000,
      spend: 8500,
      roas: 11.53,
      orders: 445,
    },
    {
      channel: "TikTok",
      revenue: 58000,
      spend: 12000,
      roas: 4.83,
      orders: 263,
    },
    {
      channel: "Direct",
      revenue: 35000,
      spend: 0,
      roas: 0,
      orders: 159,
    },
  ];
}

// ---------------------------------------------------------------------------
// 4. Notifications
// ---------------------------------------------------------------------------

export async function getNotifications(): Promise<Notification[]> {
  await delay(randomBetween(300, 550));

  return [
    {
      id: "notif-001",
      title: "Low inventory: Linen Maxi Dress",
      description: "SKU LL-DR-002 is down to 3 units. Restock recommended within 7 days.",
      type: "low_inventory",
      severity: "critical",
      timestamp: new Date().toISOString(),
      read: false,
      category: "inventory",
      actionable: true,
      actionLabel: "Create Purchase Order",
      actionUrl: "/inventory/LL-DR-002",
    },
    {
      id: "notif-002",
      title: "Revenue milestone: €840K reached!",
      description: "June revenue has surpassed the monthly target by 5.2%, hitting €847,250.",
      type: "revenue_milestone",
      severity: "success",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: false,
      category: "performance",
      actionable: false,
    },
    {
      id: "notif-003",
      title: "Summer Breeze collection restock needed",
      description: "5 items in the Summer Breeze collection are projected to stock out within 14 days.",
      type: "reorder",
      severity: "high",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      read: false,
      category: "inventory",
      actionable: true,
      actionLabel: "View Items",
      actionUrl: "/inventory?collection=Summer+Breeze",
    },
    {
      id: "notif-004",
      title: "Campaign budget: Instagram nearing cap",
      description: "Instagram campaign spend is at 94% of the €42,000 monthly cap with 2 days remaining.",
      type: "campaign_budget",
      severity: "high",
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      read: true,
      category: "marketing",
      actionable: true,
      actionLabel: "Adjust Budget",
      actionUrl: "/campaigns/instagram",
    },
    {
      id: "notif-005",
      title: "Email flow: Welcome Series performing well",
      description: "The Welcome Series flow achieved a 48.2% open rate and 12.1% click rate this week.",
      type: "high_performance",
      severity: "success",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      read: true,
      category: "email",
      actionable: false,
    },
    {
      id: "notif-006",
      title: "Slow-moving alert: Bold Statement blazer",
      description: "SKU BS-JK-008 has only sold 2 units in the last 30 days with 85 in stock.",
      type: "slow_moving",
      severity: "medium",
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      read: true,
      category: "inventory",
      actionable: true,
      actionLabel: "Analyze Product",
      actionUrl: "/inventory/BS-JK-008",
    },
    {
      id: "notif-007",
      title: "TikTok campaign ROAS dropped below target",
      description: "TikTok ROAS fell to 3.2x in the last 7 days, below the 4.0x threshold. Consider creative refresh.",
      type: "warning",
      severity: "medium",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false,
      category: "marketing",
      actionable: true,
      actionLabel: "Review Campaign",
      actionUrl: "/campaigns/tiktok",
    },
    {
      id: "notif-008",
      title: "Agent: Restock Planner completed inventory analysis",
      description: "The restock planner analyzed 200 SKUs and generated purchase recommendations for 38 items.",
      type: "info",
      severity: "info",
      timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
      read: true,
      category: "agent",
      actionable: false,
    },
  ];
}

// ---------------------------------------------------------------------------
// 5. Monthly Report
// ---------------------------------------------------------------------------

export async function getMonthlyReport(): Promise<MonthlyReport> {
  await delay(randomBetween(400, 700));

  return {
    month: "June",
    year: 2026,
    totalRevenue: 847250,
    totalOrders: 3842,
    totalMarketingSpend: 124300,
    averageROAS: 6.82,
    topPerformingChannel: "Instagram",
    topPerformingCollection: "Summer Breeze",
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    customerSatisfaction: 94.2,
    inventoryHealth: "Good — 88% of SKUs adequately stocked",
    topProducts: [
      { name: "Linen Wrap Dress", sku: "LN-DR-001", revenue: 48750, quantity: 173 },
      { name: "Boho Embroidered Top", sku: "BH-TP-003", revenue: 41200, quantity: 196 },
      { name: "Classic Silk Blouse", sku: "CC-TP-001", revenue: 38750, quantity: 142 },
      { name: "Coastal Linen Trouser", sku: "CT-PT-002", revenue: 35400, quantity: 168 },
      { name: "Summer Breeze Midi Dress", sku: "SB-DR-001", revenue: 32900, quantity: 210 },
    ],
    channels: [
      { name: "Instagram", revenue: 289000, percentage: 34.1 },
      { name: "Facebook", revenue: 195000, percentage: 23.0 },
      { name: "Google", revenue: 172000, percentage: 20.3 },
      { name: "Email", revenue: 98000, percentage: 11.6 },
      { name: "TikTok", revenue: 58000, percentage: 6.8 },
      { name: "Direct", revenue: 35250, percentage: 4.2 },
    ],
    highlights: [
      "Instagram drove 34.1% of total revenue, up from 31% last month",
      "Email marketing achieved an 11.53x ROAS — the highest of all channels",
      "Summer Breeze collection became the top-performing collection with €173K in sales",
      "Agent-driven budget reallocation saved approximately €28,400 in wasted spend",
    ],
  };
}
