"use client";

import { useState, useEffect, useMemo } from "react";
import { getForecasts } from "@/services/inventoryService";
import type { ForecastItem, PriorityLevel } from "@/types/index";
import { TableSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Package, TrendingUp, AlertTriangle, Calendar, Sparkles,
  ArrowUp, ArrowDown, Factory, ShieldAlert, XCircle,
} from "lucide-react";

// ============================================================
// Design constants
// ============================================================

const CARD = "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; dot: string; badgeBg: string; badgeText: string; badgeBorder: string }> = {
  critical: { label: "Critical", dot: "var(--danger)", badgeBg: "rgba(244,63,94,0.12)", badgeText: "var(--danger)", badgeBorder: "rgba(244,63,94,0.25)" },
  high:     { label: "High",     dot: "var(--warning)", badgeBg: "rgba(249,115,22,0.12)", badgeText: "var(--warning)", badgeBorder: "rgba(249,115,22,0.25)" },
  medium:   { label: "Medium",   dot: "#FBBF24",        badgeBg: "rgba(251,191,36,0.12)", badgeText: "#FBBF24",        badgeBorder: "rgba(251,191,36,0.25)" },
  low:      { label: "Low",      dot: "var(--body-subtle)", badgeBg: "var(--neutral-primary-medium)", badgeText: "var(--body-subtle)", badgeBorder: "var(--border-default)" },
};

const PRIORITY_BAR_COLORS: Record<PriorityLevel, string> = {
  critical: "var(--danger)",
  high: "var(--warning)",
  medium: "#FBBF24",
  low: "var(--border-default)",
};

const PRIORITY_ORDER: Record<PriorityLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };

type SortField = keyof ForecastItem;

// ============================================================
// Stat card skeleton
// ============================================================

function StatCardSkeleton() {
  return (
    <div className={`${CARD} p-4 animate-pulse space-y-3`}>
      <div className="h-3 w-2/3 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
      <div className="h-8 w-1/2 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
    </div>
  );
}

// ============================================================
// Page
// ============================================================

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("priorityLevel");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getForecasts();
        setForecasts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load forecasts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ---- Sorting ----

  const sorted = useMemo(() => {
    return [...forecasts].sort((a, b) => {
      if (sortField === "priorityLevel") {
        const aVal = PRIORITY_ORDER[a.priorityLevel];
        const bVal = PRIORITY_ORDER[b.priorityLevel];
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [forecasts, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 text-[var(--brand)]" />
      : <ArrowDown className="h-3 w-3 text-[var(--brand)]" />;
  };

  // ---- Summaries ----

  const summary = useMemo(() => {
    const unitsNeeded = forecasts.reduce((s, f) => s + f.unitsNeeded, 0);
    const expectedDemand = forecasts.reduce((s, f) => s + f.expectedDemand, 0);
    const recProduction = forecasts.reduce((s, f) => s + f.recommendedProduction, 0);
    const safetyStock = forecasts.reduce((s, f) => s + f.safetyStock, 0);
    const needsReorder = forecasts.filter((f) => f.unitsNeeded > 0).length;
    return { unitsNeeded, expectedDemand, recProduction, safetyStock, needsReorder };
  }, [forecasts]);

  const priorityCounts = useMemo(() => {
    const counts: Record<PriorityLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    forecasts.forEach((f) => counts[f.priorityLevel]++);
    return counts;
  }, [forecasts]);

  const priorityPcts = useMemo(() => {
    const total = forecasts.length || 1;
    return {
      critical: (priorityCounts.critical / total) * 100,
      high: (priorityCounts.high / total) * 100,
      medium: (priorityCounts.medium / total) * 100,
      low: (priorityCounts.low / total) * 100,
    };
  }, [priorityCounts, forecasts.length]);

  // ---- Error state ----

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`${CARD} text-center py-16`}>
          <XCircle className="h-10 w-10 text-[var(--danger)] mx-auto mb-4" />
          <p className="text-[14px] text-[var(--danger)] font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
      {/* Page Title */}
      <h1 className="text-[28px] font-semibold text-[var(--heading)]">
        Forecast &amp; Production Planning
      </h1>

      {/* Stat Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: "Units Needed",         value: formatNumber(summary.unitsNeeded), icon: Package,        color: "var(--brand)" },
            { title: "Expected Demand",      value: formatNumber(summary.expectedDemand), icon: TrendingUp,   color: "var(--brand)" },
            { title: "Rec. Production",      value: formatNumber(summary.recProduction), icon: Factory,       color: "var(--brand)" },
            { title: "Safety Stock",         value: formatNumber(summary.safetyStock), icon: ShieldAlert,     color: "var(--warning)" },
            { title: "Items Needing Reorder", value: summary.needsReorder, icon: AlertTriangle, color: "var(--danger)", valueColor: "var(--danger)" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className={`${CARD} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" style={{ color: card.color }} />
                  <span className="text-[11px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
                    {card.title}
                  </span>
                </div>
                <p
                  className="text-[24px] font-semibold text-[var(--heading)]"
                  style={(card as any).valueColor ? { color: (card as any).valueColor } : undefined}
                >
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Forecast Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className={`${CARD} overflow-x-auto`}>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--neutral-primary-medium)]">
                {([
                  { field: "sku" as SortField, label: "SKU", align: "left" as const },
                  { field: "productName" as SortField, label: "Product", align: "left" as const },
                  { field: "collection" as SortField, label: "Collection", align: "left" as const },
                  { field: "currentStock" as SortField, label: "Stock", align: "right" as const },
                  { field: "incomingStock" as SortField, label: "Incoming", align: "right" as const },
                  { field: "unitsNeeded" as SortField, label: "Units Needed", align: "right" as const },
                  { field: "expectedDemand" as SortField, label: "Exp. Demand", align: "right" as const },
                  { field: "recommendedProduction" as SortField, label: "Rec. Prod", align: "right" as const },
                  { field: "priorityLevel" as SortField, label: "Priority", align: "left" as const },
                  { field: "forecastDate" as SortField, label: "Forecast Date", align: "left" as const },
                ]).map((col) => (
                  <th
                    key={col.field}
                    className={cn(
                      "px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--body-subtle)] cursor-pointer hover:text-[var(--body)] transition-colors select-none",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                    onClick={() => handleSort(col.field)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => {
                const pcfg = PRIORITY_CONFIG[item.priorityLevel];
                return (
                  <tr
                    key={item.sku}
                    className="border-b border-[var(--border-default)] hover:bg-[var(--neutral-primary-medium)] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[12px] font-mono text-[var(--body-subtle)]">{item.sku}</td>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-[var(--heading)]">{item.productName}</td>
                    <td className="px-5 py-3.5 text-[14px] text-[var(--body)]">{item.collection}</td>
                    <td className="px-5 py-3.5 text-right text-[14px] text-[var(--body)]">{item.currentStock}</td>
                    <td className="px-5 py-3.5 text-right text-[14px] text-[var(--body)]">{item.incomingStock}</td>
                    <td className={cn(
                      "px-5 py-3.5 text-right text-[14px] font-semibold",
                      item.unitsNeeded > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"
                    )}>
                      {item.unitsNeeded > 0 ? `+${item.unitsNeeded}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[14px] text-[var(--body)]">{item.expectedDemand}</td>
                    <td className="px-5 py-3.5 text-right text-[14px] font-semibold text-[var(--heading)]">{item.recommendedProduction}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-[11px] font-semibold border"
                        style={{
                          backgroundColor: pcfg.badgeBg,
                          color: pcfg.badgeText,
                          borderColor: pcfg.badgeBorder,
                        }}
                      >
                        {pcfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[var(--body-subtle)]">
                      {format(new Date(item.forecastDate), "MMM dd, yyyy")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Priority Summary Bar */}
      {!loading && (
        <div className={`${CARD} p-5`}>
          <h2 className="text-[16px] font-semibold text-[var(--heading)] mb-4">Priority Distribution</h2>

          {/* Horizontal stacked bar */}
          <div className="flex h-4 rounded-[2px] overflow-hidden bg-[var(--neutral-primary-medium)]">
            {(["critical", "high", "medium", "low"] as PriorityLevel[]).map((level) => {
              const pct = priorityPcts[level];
              if (pct <= 0) return null;
              return (
                <div
                  key={level}
                  className="h-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: PRIORITY_BAR_COLORS[level],
                  }}
                  title={`${level}: ${priorityCounts[level]} items`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
            {(["critical", "high", "medium", "low"] as PriorityLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5 text-[12px]">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
                  style={{ backgroundColor: PRIORITY_BAR_COLORS[level] }}
                />
                <span className="text-[var(--body-subtle)] capitalize">{level}</span>
                <span className="text-[var(--heading)] font-semibold">{priorityCounts[level]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Production Planner */}
      {!loading && (
        <div
          className="p-5 rounded-[2px]"
          style={{
            backgroundColor: "var(--brand-softer)",
            border: "1px solid var(--border-brand-subtle)",
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[var(--fg-brand-strong)] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--heading)]">
                AI Production Planner
              </h2>
              <p className="text-[14px] text-[var(--body)] mt-1">
                Your AI Production Planner recommends prioritizing{" "}
                <span className="text-[var(--danger)] font-semibold">{sorted.filter((f) => f.priorityLevel === "critical").length} critical</span>{" "}
                items requiring immediate production, totaling{" "}
                <span className="text-[var(--heading)] font-semibold">{formatNumber(summary.recProduction)} units</span>.
                Key actions:
              </p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2 text-[13px] text-[var(--danger)]">
                  <span className="inline-block w-1 h-1 rounded-full bg-[var(--danger)] shrink-0" />
                  Sunlit Wrap Skirt — URGENT: 75 units needed, stock out imminent
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[var(--danger)]">
                  <span className="inline-block w-1 h-1 rounded-full bg-[var(--danger)] shrink-0" />
                  Sunlit Wrap Maxi Dress — Immediate restock: 100 units, high lost sales risk
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[var(--warning)]">
                  <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: "var(--warning)" }} />
                  Linen Maxi Dress — Monitor: incoming covers short-term, 40 extra units recommended
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[var(--warning)]">
                  <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: "var(--warning)" }} />
                  Bloom Strapless Gown — Restock 60 units for wedding season demand
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
