"use client";

import { useState, useEffect, useCallback } from "react";
import { getTimeSeriesData } from "@/services/dashboardService";
import type { TimeSeriesData, TimeFrame } from "@/types/index";
import TrendChart from "@/components/charts/TrendChart";
import { ChartSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { Sparkles, TrendingUp, DollarSign, ShoppingCart, Users, Percent } from "lucide-react";

// ============================================================
// Design constants
// ============================================================

const CARD = "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

const TIMEFRAMES: { label: string; value: TimeFrame }[] = [
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "12M", value: "12m" },
];

// ============================================================
// Stat card skeleton
// ============================================================

function StatSkeleton() {
  return (
    <div className={`${CARD} p-4 animate-pulse space-y-3`}>
      <div className="h-3 w-1/2 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
      <div className="h-7 w-2/3 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
    </div>
  );
}

// ============================================================
// Page
// ============================================================

export default function TrendsPage() {
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (tf: TimeFrame) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTimeSeriesData(tf);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trend data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(timeframe);
  }, [timeframe, fetchData]);

  // ---- Derived ----

  const latest = data?.dataPoints?.[data.dataPoints.length - 1];
  const latestRevenue = latest?.revenue ?? 0;
  const latestOrders = latest?.orders ?? 0;
  const latestSessions = latest?.sessions ?? 0;
  const latestCvr = latest?.conversionRate ?? 0;

  // ---- Error state ----

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`${CARD} text-center py-16`}>
          <p className="text-[14px] text-[var(--danger)] font-semibold mb-4">{error}</p>
          <button
            onClick={() => fetchData(timeframe)}
            className="px-5 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
            style={{ background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- Render ----

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="text-[28px] font-semibold text-[var(--heading)]">
          Trends &amp; Insights
        </h1>
        <div className="flex gap-1 self-start">
          {TIMEFRAMES.map((tf) => {
            const active = timeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={cn(
                  "px-4 py-2.5 text-[14px] font-semibold rounded-[2px] transition-colors",
                  active ? "text-white" : "text-[var(--body)] hover:text-[var(--heading)]"
                )}
                style={
                  active
                    ? { background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)" }
                    : { backgroundColor: "var(--neutral-primary-medium)" }
                }
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Row — 3 compact TrendCharts */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <ChartSkeleton key={i} className="h-72" />)}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${CARD} p-4`}>
            <h2 className="text-[16px] font-semibold text-[var(--heading)] mb-3">Revenue Trend</h2>
            <TrendChart
              title="Revenue Trend"
              data={data.dataPoints.map((d) => ({ date: d.date, value: d.revenue }))}
              format="currency"
              color="#D94FB0"
              height={240}
            />
          </div>
          <div className={`${CARD} p-4`}>
            <h2 className="text-[16px] font-semibold text-[var(--heading)] mb-3">Marketing Spend</h2>
            <TrendChart
              title="Marketing Spend"
              data={data.dataPoints.map((d) => ({ date: d.date, value: d.marketingSpend }))}
              format="currency"
              color="#8B5CF6"
              height={240}
            />
          </div>
          <div className={`${CARD} p-4`}>
            <h2 className="text-[16px] font-semibold text-[var(--heading)] mb-3">ROAS Trend</h2>
            <TrendChart
              title="ROAS Trend"
              data={data.dataPoints.map((d) => ({ date: d.date, value: d.roas }))}
              format="number"
              color="#14B8A6"
              height={240}
            />
          </div>
        </div>
      ) : null}

      {/* Key Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue", value: formatCurrency(latestRevenue), icon: DollarSign,   color: "#D94FB0" },
            { label: "Orders", value: formatNumber(latestOrders), icon: ShoppingCart, color: "#F97316" },
            { label: "Sessions", value: formatNumber(latestSessions), icon: Users,        color: "#8B5CF6" },
            { label: "Conv. Rate", value: `${latestCvr}%`, icon: Percent,      color: "#14B8A6" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`${CARD} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: m.color }} />
                  <span className="text-[11px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
                    {m.label}
                  </span>
                </div>
                <p className="text-[24px] font-semibold text-[var(--heading)]">{m.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Insights Card */}
      {data && !loading && (
        <div
          className="p-5 rounded-[2px]"
          style={{
            backgroundColor: "var(--brand-softer)",
            border: "1px solid var(--border-brand-subtle)",
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[var(--fg-brand-strong)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-[16px] font-semibold text-[var(--heading)] mb-3">
                AI Trend Analysis
              </h2>
              <p className="text-[14px] text-[var(--body)] mb-4">
                Your AI agent analyzed <span className="text-[var(--heading)] font-semibold">{data.dataPoints.length} data points</span>{" "}
                across revenue, spend, and ROAS for the selected timeframe.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: "#10B981" }}
                  />
                  <p className="text-[13px] text-[var(--body)]">
                    <span className="text-[var(--heading)] font-semibold">Revenue momentum is strong.</span>{" "}
                    Total revenue reached{" "}
                    <span className="text-[var(--success)] font-semibold">{formatCurrency(data.totals.revenue)}</span>{" "}
                    across the period, with daily averages accelerating. The upward trend line indicates sustained growth.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: "#F97316" }}
                  />
                  <p className="text-[13px] text-[var(--body)]">
                    <span className="text-[var(--heading)] font-semibold">Spend efficiency is improving.</span>{" "}
                    Average ROAS sits at{" "}
                    <span className="text-[var(--success)] font-semibold">{data.averages.roas.toFixed(2)}x</span>,
                    with marketing spend growing slower than revenue — signaling better campaign optimization and budget reallocation.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: "#8B5CF6" }}
                  />
                  <p className="text-[13px] text-[var(--body)]">
                    <span className="text-[var(--heading)] font-semibold">Key opportunities identified:</span>{" "}
                    (1) Scale Instagram retargeting campaigns for the highest ROAS channel, (2) Expand email flows for
                    Linen Luxe and Summer Breeze collections, (3) Increase production velocity for fast-moving
                    items to prevent stockout revenue loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
