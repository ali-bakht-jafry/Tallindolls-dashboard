"use client";

import { useState, useEffect, useCallback } from "react";
import { getTimeSeriesData } from "@/services/dashboardService";
import { getChannelData } from "@/services/dashboardService";
import type { TimeSeriesData, TimeFrame, ChannelData } from "@/types/index";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import { ChartSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { DollarSign, ShoppingCart, TrendingUp, CreditCard } from "lucide-react";

const TIMEFRAMES: { label: string; value: TimeFrame }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "12M", value: "12m" },
];

const CARD = "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

export default function RevenuePage() {
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [timeframe, setTimeframe] = useState<TimeFrame>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (tf: TimeFrame) => {
    try {
      setLoading(true);
      setError(null);
      const [tsData, chData] = await Promise.all([
        getTimeSeriesData(tf),
        getChannelData(),
      ]);
      setData(tsData);
      setChannels(chData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(timeframe); }, [timeframe, fetchData]);

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`${CARD} text-center py-16`}>
          <p className="text-[var(--danger)] font-semibold text-[14px] mb-4">{error}</p>
          <button onClick={() => fetchData(timeframe)} className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px]" style={{ background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)" }}>Retry</button>
        </div>
      </div>
    );
  }

  const statCards = data ? [
    { label: "Total Revenue", value: formatCurrency(data.totals.revenue), icon: DollarSign, change: "+12.5%" },
    { label: "Total Orders", value: formatNumber(data.totals.orders), icon: ShoppingCart, change: "+8.3%" },
    { label: "Avg ROAS", value: `${data.averages.roas.toFixed(2)}x`, icon: TrendingUp, change: "+5.1%" },
    { label: "Marketing Spend", value: formatCurrency(data.totals.marketingSpend), icon: CreditCard, change: "-3.2%" },
  ] : [];

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-8">
      {/* Header + Timeframe */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-[28px] font-semibold text-[var(--heading)] leading-tight">
          Revenue Analytics
        </h3>
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={cn(
                "px-4 py-2 text-[13px] font-semibold rounded-[2px] transition-colors",
                timeframe === tf.value
                  ? "text-white"
                  : "text-[var(--body)] hover:text-[var(--heading)] bg-[var(--neutral-secondary-medium)]"
              )}
              style={timeframe === tf.value ? { background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)" } : {}}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      {!loading && data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${CARD} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="size-4 text-[var(--brand)]" />
                  <span className="text-[11px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="text-[24px] font-semibold text-[var(--heading)] leading-tight">{s.value}</p>
                <p className="text-[12px] font-semibold text-[var(--success)] mt-0.5">{s.change} vs last period</p>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <ChartSkeleton key={i} />)}
        </div>
      )}

      {/* Revenue Trend Chart */}
      {loading ? <ChartSkeleton /> : data ? (
        <div className={`${CARD} p-6`}>
          <h4 className="text-[16px] font-semibold text-[var(--heading)] mb-4">Revenue & Orders Trend</h4>
          <TimeSeriesChart
            data={data.dataPoints}
            metrics={[
              { key: "revenue", label: "Revenue", color: "#D94FB0", format: "currency" },
              { key: "orders", label: "Orders", color: "#8B5CF6", format: "number" },
            ]}
            height={300}
          />
        </div>
      ) : null}

      {/* Channel Breakdown — data table, not chart */}
      {channels.length > 0 && (
        <div className={`${CARD} overflow-x-auto`}>
          <div className="px-6 py-4 border-b border-[var(--border-default)]">
            <h4 className="text-[16px] font-semibold text-[var(--heading)]">Channel Breakdown</h4>
          </div>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[rgba(255,255,255,0.02)]">
                <th className="text-left px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">Channel</th>
                <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">Revenue</th>
                <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">Spend</th>
                <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">ROAS</th>
                <th className="text-right px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => (
                <tr key={ch.channel} className="border-b border-[var(--border-default)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-6 py-3.5 text-[14px] font-medium text-[var(--heading)]">{ch.channel}</td>
                  <td className="px-6 py-3.5 text-right text-[14px] text-[var(--body)]">{formatCurrency(ch.revenue)}</td>
                  <td className="px-6 py-3.5 text-right text-[14px] text-[var(--body)]">{formatCurrency(ch.spend)}</td>
                  <td className="px-6 py-3.5 text-right text-[14px] font-semibold text-[var(--heading)]">{ch.roas.toFixed(2)}x</td>
                  <td className="px-6 py-3.5 text-right text-[14px] text-[var(--body)]">{formatNumber(ch.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
