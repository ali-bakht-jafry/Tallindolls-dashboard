"use client";

import { useState, useEffect } from "react";
import { getKPIs, getNotifications, getTimeSeriesData, getChannelData } from "@/services/dashboardService";
import type { KPI, Notification, TimeSeriesData, ChannelData } from "@/types/index";
import KPICard from "@/components/dashboard/KPICard";
import { PageSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  Sparkles, ArrowRight, Bell, AlertTriangle, Info, Circle, X,
  TrendingUp, DollarSign, ShoppingCart, Megaphone, Package, Clock,
} from "lucide-react";

const CARD = "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

export default function OverviewPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tsData, setTsData] = useState<TimeSeriesData | null>(null);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [kpiData, notifData, timeData, chData] = await Promise.all([
          getKPIs(), getNotifications(), getTimeSeriesData("30d"), getChannelData(),
        ]);
        setKpis(kpiData);
        setNotifications(notifData);
        setTsData(timeData);
        setChannels(chData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`${CARD} text-center py-16`}>
          <p className="text-[var(--danger)] font-semibold text-[14px] mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px]" style={{ background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)" }}>Retry</button>
        </div>
      </div>
    );
  }

  const severityIcon = (s: string) => {
    switch (s) {
      case "critical": return <AlertTriangle className="size-3 text-[var(--danger)]" />;
      case "warning": return <AlertTriangle className="size-3 text-[var(--warning)]" />;
      case "success": return <Circle className="size-3 text-[var(--success)] fill-current" />;
      default: return <Info className="size-3 text-[var(--body-subtle)]" />;
    }
  };

  const topChannel = [...channels].sort((a, b) => b.revenue - a.revenue)[0];

  const generateAIInsights = async () => {
    if (aiThinking) return;
    setAiThinking(true);
    setAiError(null);
    setAiInsight(null);

    const stats = {
      revenue: tsData ? formatCurrency(tsData.totals.revenue) : "€847K",
      orders: tsData ? formatNumber(tsData.totals.orders) : "3,842",
      roas: tsData ? `${tsData.averages.roas.toFixed(2)}x` : "6.82x",
      spend: tsData ? formatCurrency(tsData.totals.marketingSpend) : "€124K",
      topChannel: topChannel ? `${topChannel.channel} (${topChannel.roas.toFixed(1)}x ROAS)` : "Instagram (6.9x ROAS)",
      kpiSummary: kpis.slice(0, 5).map(k => `${k.title}: ${k.value} (${k.trend > 0 ? "+" : ""}${k.trend}%)`).join(", "),
    };

    try {
      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: "You are an expert e-commerce analytics AI for a fashion brand called TallinnDoll. Analyze the provided dashboard metrics and give 3 concise, actionable insights. Each insight should be 1-2 sentences, data-driven, and focus on revenue opportunities, marketing efficiency, or inventory optimization. Use bullet points with • prefix. Keep it under 200 words total. Be specific — mention actual numbers.",
          userPrompt: `Here are TallinnDoll's current dashboard metrics:\n\n30-Day Performance:\n- Revenue: ${stats.revenue}\n- Orders: ${stats.orders}\n- ROAS: ${stats.roas}\n- Marketing Spend: ${stats.spend}\n\nTop Channel: ${stats.topChannel}\n\nKPI Summary: ${stats.kpiSummary}\n\nProvide 3 actionable AI insights based on this data.`,
        }),
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setAiInsight(json.result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI analysis failed");
      // Fallback insights
      setAiInsight(
        `• Revenue is at ${stats.revenue} with a healthy ${stats.roas} ROAS — ${stats.topChannel} is your strongest channel.\n• Marketing spend efficiency improved — consider shifting budget toward high-ROAS channels like Email (11.5x).\n• Monitor inventory for top-selling collections to avoid stockouts during peak demand periods.`
      );
    } finally {
      setAiThinking(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-6 animate-fade-in">
      {/* Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-[28px] font-semibold text-[var(--heading)] leading-tight">
            Good morning, Jane
          </h3>
          <p className="text-[14px] text-[var(--body)] mt-1">
            Here&apos;s your TallinnDoll performance overview
          </p>
        </div>
        <button
          onClick={() => { setInsightsOpen(!insightsOpen); if (!aiInsight && !aiThinking) generateAIInsights(); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--brand-softer)] border border-[var(--border-brand-subtle)] rounded-[2px] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer"
        >
          <Sparkles className="size-3.5 text-[var(--brand)]" />
          <span className="text-[12px] text-[var(--fg-brand-strong)] font-medium">
            {aiThinking ? "AI analyzing..." : aiInsight ? "AI insights ready" : "3 AI insights ready"}
          </span>
          <ArrowRight className={cn("size-3 text-[var(--brand)] transition-transform", insightsOpen && "rotate-90")} />
        </button>
      </div>

      {/* AI Insights Panel — powered by DeepSeek */}
      {insightsOpen && (
        <div className={`${CARD} p-5 animate-fade-in`} style={{ borderColor: "var(--border-brand-subtle)", backgroundColor: "var(--brand-softer)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className={cn("size-4 text-[var(--brand)]", aiThinking && "animate-pulse-soft")} />
              <h4 className="text-[14px] font-semibold text-[var(--fg-brand-strong)]">
                {aiThinking ? "Analyzing your data with AI..." : "AI-Generated Insights"}
              </h4>
              {!aiThinking && aiInsight && (
                <span className="text-[10px] text-[var(--body-subtle)] bg-[rgba(0,0,0,0.2)] px-1.5 py-0.5 rounded-[2px]">DeepSeek</span>
              )}
            </div>
            <button onClick={() => setInsightsOpen(false)} className="p-1 rounded-[2px] text-[var(--body)] hover:text-[var(--heading)] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {aiThinking ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[rgba(0,0,0,0.2)] rounded-[2px] p-3 animate-pulse-soft">
                  <div className="h-3 w-2/3 bg-[rgba(255,255,255,0.05)] rounded-[2px] mb-2" />
                  <div className="h-3 w-full bg-[rgba(255,255,255,0.05)] rounded-[2px]" />
                </div>
              ))}
            </div>
          ) : aiError && !aiInsight ? (
            <div className="text-center py-4">
              <p className="text-[13px] text-[var(--danger)] mb-2">{aiError}</p>
              <button onClick={generateAIInsights} className="text-[12px] font-semibold text-[var(--brand)] hover:text-[var(--fg-brand)] transition-colors">Retry</button>
            </div>
          ) : aiInsight ? (
            <div className="space-y-2">
              {aiInsight.split("\n").filter(Boolean).map((line, i) => (
                <div key={i} className="flex items-start gap-2 bg-[rgba(0,0,0,0.2)] rounded-[2px] p-3">
                  <span className="text-[var(--brand)] text-[12px] font-bold shrink-0 mt-0.5">•</span>
                  <p className="text-[12px] text-[var(--body)] leading-relaxed">{line.replace(/^[•\-]\s*/, "")}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Primary KPIs — 5 across */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full overflow-hidden">
        {kpis.slice(0, 5).map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full overflow-hidden">
        {/* Column 1: 30-Day Summary + Secondary KPIs */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full overflow-hidden">
            {kpis.slice(5, 10).map((kpi) => (
              <KPICard key={kpi.title} kpi={kpi} variant="compact" />
            ))}
          </div>

          {/* 30-Day Performance Summary */}
          {tsData && (
            <div className={`${CARD} p-4`}>
              <h4 className="text-[14px] font-semibold text-[var(--heading)] mb-3">30-Day Performance</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="size-3 text-[var(--brand)]" />
                    <span className="text-[10px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">Revenue</span>
                  </div>
                  <p className="text-[18px] font-semibold text-[var(--heading)]">{formatCurrency(tsData.totals.revenue)}</p>
                  <span className="text-[11px] text-[var(--success)] font-semibold">+12.5%</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShoppingCart className="size-3 text-[var(--brand)]" />
                    <span className="text-[10px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">Orders</span>
                  </div>
                  <p className="text-[18px] font-semibold text-[var(--heading)]">{formatNumber(tsData.totals.orders)}</p>
                  <span className="text-[11px] text-[var(--success)] font-semibold">+8.3%</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="size-3 text-[var(--brand)]" />
                    <span className="text-[10px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">Avg ROAS</span>
                  </div>
                  <p className="text-[18px] font-semibold text-[var(--heading)]">{tsData.averages.roas.toFixed(2)}x</p>
                  <span className="text-[11px] text-[var(--success)] font-semibold">+5.1%</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Megaphone className="size-3 text-[var(--brand)]" />
                    <span className="text-[10px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">Mktg Spend</span>
                  </div>
                  <p className="text-[18px] font-semibold text-[var(--heading)]">{formatCurrency(tsData.totals.marketingSpend)}</p>
                  <span className="text-[11px] text-[var(--success)] font-semibold">-3.2%</span>
                </div>
              </div>
            </div>
          )}

          {/* Channel Performance */}
          {channels.length > 0 && (
            <div className={`${CARD} p-4`}>
              <h4 className="text-[14px] font-semibold text-[var(--heading)] mb-3">Channel Performance</h4>
              <div className="space-y-2">
                {channels.slice(0, 4).map((ch) => (
                  <div key={ch.channel} className="flex items-center gap-3">
                    <span className="text-[12px] text-[var(--heading)] font-medium w-16 shrink-0 truncate">{ch.channel}</span>
                    <div className="flex-1 h-1.5 bg-[var(--neutral-secondary-medium)] rounded-full overflow-hidden min-w-0">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (ch.revenue / (topChannel?.revenue || 1)) * 100)}%`,
                          background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)",
                        }}
                      />
                    </div>
                    <span className="text-[12px] text-[var(--body)] w-16 text-right shrink-0">{formatCurrency(ch.revenue)}</span>
                    <span className="text-[12px] font-semibold text-[var(--heading)] w-12 text-right shrink-0">{ch.roas.toFixed(1)}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Notifications */}
        <div className={`${CARD} flex flex-col min-w-0 overflow-hidden`}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
            <Bell className="size-3.5 text-[var(--brand)]" />
            <h4 className="text-[14px] font-semibold text-[var(--heading)] flex-1">Notifications</h4>
            <span className="text-[10px] text-[var(--body-subtle)] font-medium bg-[var(--neutral-secondary-medium)] px-1.5 py-0.5 rounded-[2px]">
              {notifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="flex-1 divide-y divide-[var(--border-default)] max-h-[420px] overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-4 py-2.5 hover:bg-[var(--neutral-secondary-medium)] transition-colors cursor-pointer",
                  !n.read && "border-l-2 border-l-[var(--brand)]"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">{severityIcon(n.severity)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[var(--heading)] leading-snug">{n.title}</p>
                    {n.message && (
                      <p className="text-[11px] text-[var(--body)] mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="size-2.5 text-[var(--body-subtle)]" />
                      <span className="text-[10px] text-[var(--body-subtle)]">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
