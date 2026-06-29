"use client";

import { useState, useEffect, useCallback } from "react";
import { getFacebookCampaigns, getFacebookMetrics } from "@/services/facebookService";
import { getKlaviyoMetrics, getKlaviyoMonthlyData } from "@/services/klaviyoService";
import { getGoogleAnalyticsMetrics, getTopLandingPages } from "@/services/analyticsService";
import { convertUsdToEur } from "@/services/currencyService";
import type { FacebookCampaign, KlaviyoMonthlyData, LandingPageMetrics, FacebookAdSummary } from "@/types/index";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  Mail,
  Users,
  Activity,
  Globe,
  ArrowRight,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CARD =
  "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

type MarketingTab = "facebook" | "klaviyo" | "ga";

const TABS: { key: MarketingTab; label: string }[] = [
  { key: "facebook", label: "Facebook Ads" },
  { key: "klaviyo", label: "Klaviyo Email" },
  { key: "ga", label: "Google Analytics" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    active: {
      label: "Active",
      bg: "var(--brand-softer)",
      text: "var(--brand)",
      border: "var(--border-brand-subtle)",
    },
    paused: {
      label: "Paused",
      bg: "rgba(249,115,22,0.15)",
      text: "var(--warning)",
      border: "rgba(249,115,22,0.3)",
    },
    completed: {
      label: "Completed",
      bg: "rgba(107,114,128,0.15)",
      text: "#6B7280",
      border: "rgba(107,114,128,0.3)",
    },
  };
  const cfg = config[status] ?? config.completed;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[12px] font-medium border"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
      }}
    >
      {cfg.label}
    </span>
  );
}

function StatCardSkeleton() {
  return (
    <div className={cn(CARD, "p-4 animate-pulse")}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
        <div className="h-3 w-20 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
      </div>
      <div className="h-7 w-24 rounded-[2px] bg-[rgba(255,255,255,0.04)] mb-2" />
      <div className="h-3 w-28 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
    </div>
  );
}

function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }, (_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 rounded-[2px] bg-[rgba(255,255,255,0.04)] animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Stat card factory
// ---------------------------------------------------------------------------

interface StatCardDef {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendDown?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, trendDown }: StatCardDef) {
  return (
    <div className={cn(CARD, "p-4")}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-[var(--brand)] shrink-0" />
        <span className="text-[12px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className="text-[24px] font-semibold text-[var(--heading)]">
        {value}
      </p>
      <p
        className={cn(
          "text-[12px] font-medium mt-1",
          trendDown ? "text-[var(--success)]" : "text-[var(--success)]"
        )}
      >
        {trend} vs last period
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<MarketingTab>("facebook");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Facebook state
  const [fbCampaigns, setFbCampaigns] = useState<FacebookCampaign[]>([]);
  const [fbMetrics, setFbMetrics] = useState<FacebookAdSummary | null>(null);

  // Klaviyo state
  const [klMetrics, setKlMetrics] = useState<{
    totalEmailRevenue: number;
    totalCampaignRevenue: number;
    totalFlowRevenue: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalSubscribers: number;
    totalSends: number;
  } | null>(null);
  const [klMonthly, setKlMonthly] = useState<KlaviyoMonthlyData[]>([]);

  // GA state
  const [gaMetrics, setGaMetrics] = useState<{
    totalSessions: number;
    totalUsers: number;
    avgBounceRate: number;
    avgSessionDuration: number;
    avgConversionRate: number;
  } | null>(null);
  const [gaLandingPages, setGaLandingPages] = useState<LandingPageMetrics[]>(
    []
  );

  // Currency
  const [eurAmount, setEurAmount] = useState<number | null>(null);

  const loadTab = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "facebook": {
          const [campaigns, metrics] = await Promise.all([
            getFacebookCampaigns(),
            getFacebookMetrics(),
          ]);
          setFbCampaigns(campaigns);
          setFbMetrics(metrics);
          break;
        }
        case "klaviyo": {
          const [metrics, monthly] = await Promise.all([
            getKlaviyoMetrics(),
            getKlaviyoMonthlyData(),
          ]);
          setKlMetrics(metrics);
          setKlMonthly(monthly);
          break;
        }
        case "ga": {
          const [metrics, pages] = await Promise.all([
            getGoogleAnalyticsMetrics(),
            getTopLandingPages(),
          ]);
          setGaMetrics(metrics);
          setGaLandingPages(pages);
          break;
        }
      }

      // Load currency conversion once (cached by service on subsequent calls)
      if (eurAmount === null) {
        const conversion = await convertUsdToEur(50000);
        setEurAmount(conversion.eurAmount);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load marketing data"
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, eurAmount]);

  useEffect(() => {
    loadTab();
  }, [loadTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-8">
      {/* Page Title */}
      <h1 className="text-[28px] font-semibold text-[var(--heading)]">
        Marketing Performance
      </h1>

      {/* Tab Navigation — underline variant */}
      <div className="flex gap-0 border-b border-[var(--border-default)]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-4 text-[14px] font-medium transition-colors relative",
                isActive
                  ? "text-[var(--brand)]"
                  : "text-[var(--body)] hover:text-[var(--heading)]"
              )}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: "var(--brand)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div
          className={cn(
            CARD,
            "text-center py-16 flex flex-col items-center gap-4"
          )}
        >
          <p className="text-[var(--danger)] font-semibold text-[14px]">
            {error}
          </p>
          <button
            onClick={loadTab}
            className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
            style={{
              background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* FACEBOOK ADS                                                */}
      {/* ============================================================ */}
      {activeTab === "facebook" && (
        <div className="space-y-6">
          {loading ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
              <div className={cn(CARD, "overflow-x-auto")}>
                <table className="w-full">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                      {Array.from({ length: 7 }, (_, i) => (
                        <th key={i} className="px-6 py-3">
                          <div className="h-3 w-16 rounded-[2px] bg-[rgba(255,255,255,0.04)] animate-pulse" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <TableRowSkeleton cols={7} />
                  </tbody>
                </table>
              </div>
            </>
          ) : fbMetrics ? (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Spend"
                  value={formatCurrency(fbMetrics.totalSpend)}
                  icon={DollarSign}
                  trend="-3.2%"
                />
                <StatCard
                  title="Impressions"
                  value={formatNumber(fbMetrics.totalImpressions)}
                  icon={Eye}
                  trend="+15.7%"
                />
                <StatCard
                  title="CTR"
                  value={`${fbMetrics.averageCTR}%`}
                  icon={MousePointerClick}
                  trend="+0.4%"
                />
                <StatCard
                  title="ROAS"
                  value={`${fbMetrics.blendedROAS}x`}
                  icon={Target}
                  trend="+5.1%"
                />
              </div>

              {/* Campaign Table */}
              <div className={cn(CARD, "overflow-x-auto")}>
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                      <th className="text-left px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="text-left px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Spend
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Impressions
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        CTR
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        ROAS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fbCampaigns.map((camp) => (
                      <tr
                        key={camp.id}
                        className="border-b border-[var(--border-default)] transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="px-6 py-4 text-[14px] font-medium text-[var(--heading)]">
                          {camp.name}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={camp.status} />
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatCurrency(camp.spend)}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatNumber(camp.impressions)}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatNumber(camp.clicks)}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {camp.ctr.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] font-semibold text-[var(--heading)]">
                          {camp.roas.toFixed(2)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================ */}
      {/* KLAVIYO EMAIL                                               */}
      {/* ============================================================ */}
      {activeTab === "klaviyo" && (
        <div className="space-y-6">
          {loading ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
              <div className={cn(CARD, "overflow-x-auto")}>
                <table className="w-full">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                      {Array.from({ length: 6 }, (_, i) => (
                        <th key={i} className="px-6 py-3">
                          <div className="h-3 w-16 rounded-[2px] bg-[rgba(255,255,255,0.04)] animate-pulse" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <TableRowSkeleton cols={6} />
                  </tbody>
                </table>
              </div>
            </>
          ) : klMetrics ? (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Email Revenue"
                  value={formatCurrency(klMetrics.totalEmailRevenue)}
                  icon={DollarSign}
                  trend="+12.3%"
                />
                <StatCard
                  title="Open Rate"
                  value={`${klMetrics.avgOpenRate}%`}
                  icon={Mail}
                  trend="+2.1%"
                />
                <StatCard
                  title="Click Rate"
                  value={`${klMetrics.avgClickRate}%`}
                  icon={MousePointerClick}
                  trend="+0.5%"
                />
                <StatCard
                  title="Subscribers"
                  value={formatNumber(klMetrics.totalSubscribers)}
                  icon={Users}
                  trend="+4.8%"
                />
              </div>

              {/* Monthly Data Table */}
              <div className={cn(CARD, "overflow-x-auto")}>
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                      <th className="text-left px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Month
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Open Rate
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Click Rate
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Sends
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Subscribers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {klMonthly.map((m) => (
                      <tr
                        key={m.month}
                        className="border-b border-[var(--border-default)] transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="px-6 py-4 text-[14px] font-medium text-[var(--heading)]">
                          {format(new Date(m.month), "MMM yyyy")}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatCurrency(m.emailRevenue)}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {m.openRate}%
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {m.clickRate}%
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatNumber(m.sends)}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatNumber(m.subscribers)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================ */}
      {/* GOOGLE ANALYTICS                                            */}
      {/* ============================================================ */}
      {activeTab === "ga" && (
        <div className="space-y-6">
          {loading ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
              <div className={cn(CARD, "overflow-x-auto")}>
                <table className="w-full">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                      {Array.from({ length: 4 }, (_, i) => (
                        <th key={i} className="px-6 py-3">
                          <div className="h-3 w-16 rounded-[2px] bg-[rgba(255,255,255,0.04)] animate-pulse" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <TableRowSkeleton cols={4} />
                  </tbody>
                </table>
              </div>
            </>
          ) : gaMetrics ? (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Sessions"
                  value={formatNumber(gaMetrics.totalSessions)}
                  icon={Activity}
                  trend="+15.7%"
                />
                <StatCard
                  title="Users"
                  value={formatNumber(gaMetrics.totalUsers)}
                  icon={Users}
                  trend="+12.3%"
                />
                <StatCard
                  title="Bounce Rate"
                  value={`${gaMetrics.avgBounceRate}%`}
                  icon={TrendingDown}
                  trend="-2.1%"
                  trendDown
                />
                <StatCard
                  title="Conversion Rate"
                  value={`${gaMetrics.avgConversionRate}%`}
                  icon={Target}
                  trend="+0.4%"
                />
              </div>

              {/* Landing Pages Table */}
              <div className={cn(CARD, "overflow-x-auto")}>
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                      <th className="text-left px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Landing Page
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        Conversions
                      </th>
                      <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                        CVR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {gaLandingPages.map((p) => (
                      <tr
                        key={p.page}
                        className="border-b border-[var(--border-default)] transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="px-6 py-4 text-[14px] font-medium text-[var(--heading)]">
                          {p.page}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatNumber(p.sessions)}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {formatNumber(p.conversions)}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                          {p.sessions > 0
                            ? ((p.conversions / p.sessions) * 100).toFixed(2)
                            : "0.00"}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================ */}
      {/* CURRENCY CONVERTER                                          */}
      {/* ============================================================ */}
      {eurAmount != null && (
        <div className={cn(CARD, "p-5")}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-4 text-[var(--brand)]" />
            <h3 className="text-[16px] font-semibold text-[var(--heading)]">
              Currency Conversion
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[20px] font-semibold text-[var(--heading)]">
              $50,000 USD
            </span>
            <ArrowRight className="size-5 text-[var(--body-subtle)]" />
            <span className="text-[20px] font-semibold text-[var(--brand)]">
              {formatCurrency(eurAmount)} EUR
            </span>
          </div>
          <p className="text-[12px] text-[var(--body-subtle)] mt-2">
            Rate: 1 USD = 0.92 EUR
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* AI CAMPAIGN INTELLIGENCE                                     */}
      {/* ============================================================ */}
      <div
        className="p-5 rounded-[2px]"
        style={{
          backgroundColor: "var(--brand-softer)",
          border: "1px solid var(--border-brand-subtle)",
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-[var(--brand)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--heading)]">
              AI Campaign Intelligence
            </h3>
            <p className="text-[14px] text-[var(--body)] mt-2 leading-relaxed">
              Your AI Agent analyzed cross-channel performance. Instagram drove
              34.1% of revenue with a 6.88x ROAS. Email marketing achieved the
              highest ROAS at 11.53x. Opportunity: reallocate budget from
              underperforming Boho Spirit Lookalike to Instagram Summer
              Collection to improve blended ROAS by 0.4x.
            </p>
            <ul className="mt-3 space-y-2 text-[14px]">
              <li className="flex items-center gap-2 text-[var(--success)]">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>Instagram retargeting ROAS up 12% week-over-week</span>
              </li>
              <li className="flex items-center gap-2 text-[var(--warning)]">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>
                  TikTok ROAS dropped to 3.2x -- consider creative refresh
                </span>
              </li>
              <li className="flex items-center gap-2 text-[#8B5CF6]">
                <BarChart3 className="size-3.5 shrink-0" />
                <span>Email Welcome Series achieved 48.2% open rate</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
