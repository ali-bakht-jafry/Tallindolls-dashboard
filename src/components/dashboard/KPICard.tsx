"use client";

import { cn, formatPercent } from "@/lib/utils";
import type { KPI } from "@/types/index";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  kpi: KPI;
  variant?: "default" | "compact";
}

export default function KPICard({ kpi, variant = "default" }: KPICardProps) {
  const { title, value, trend, status } = kpi;
  const isPositive = status === "positive";
  const isNegative = status === "negative";

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)] animate-fade-in",
        variant === "default" ? "p-4" : "p-3"
      )}
    >
      {/* Label — wraps naturally, no truncation */}
      <span className="block text-[10px] font-bold text-[var(--body-subtle)] uppercase tracking-widest leading-tight mb-2">
        {title}
      </span>

      {/* Value — compressed but always fully visible */}
      <p
        className={cn(
          "font-bold text-[var(--heading)] leading-tight mb-1 tracking-tight truncate",
          variant === "default" ? "text-2xl lg:text-[26px]" : "text-lg"
        )}
      >
        {value}
      </p>

      {/* Trend */}
      <div className="flex items-center gap-1 min-w-0">
        {trend !== 0 && (
          <>
            {isPositive ? (
              <TrendingUp className="size-3 text-[var(--success)] shrink-0" />
            ) : isNegative ? (
              <TrendingDown className="size-3 text-[var(--danger)] shrink-0" />
            ) : null}
            <span
              className={cn(
                "text-[11px] font-semibold truncate",
                isPositive && "text-[var(--success)]",
                isNegative && "text-[var(--danger)]",
                !isPositive && !isNegative && "text-[var(--body-subtle)]"
              )}
            >
              {formatPercent(trend)}
            </span>
          </>
        )}
        {trend === 0 && (
          <span className="text-[11px] text-[var(--body-subtle)]">—</span>
        )}
      </div>
    </div>
  );
}
