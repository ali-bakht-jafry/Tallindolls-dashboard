"use client";

import { cn } from "@/lib/utils";

/** A single KPI skeleton card */
function KpiCardSkeleton() {
  return (
    <div className="rounded-[2px] bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] animate-shimmer h-32" />
  );
}

/** 4 KPI skeleton cards in a responsive grid (2 cols on md, 4 cols on xl) */
export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCardSkeleton />
      <KpiCardSkeleton />
      <KpiCardSkeleton />
      <KpiCardSkeleton />
    </div>
  );
}

/** Chart skeleton placeholder */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[2px] bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] animate-shimmer h-80",
        className
      )}
    />
  );
}

/** Table skeleton with header row + 8 body rows and alternating shimmer */
export function TableSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[2px] bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] p-4 space-y-3",
        className
      )}
    >
      {/* Header row */}
      <div className="flex gap-4 animate-shimmer">
        <div className="h-4 rounded w-1/4 bg-[var(--neutral-primary-medium)]" />
        <div className="h-4 rounded w-1/5 bg-[var(--neutral-primary-medium)]" />
        <div className="h-4 rounded w-1/6 bg-[var(--neutral-primary-medium)]" />
        <div className="h-4 rounded w-1/6 bg-[var(--neutral-primary-medium)]" />
        <div className="h-4 rounded w-1/5 bg-[var(--neutral-primary-medium)]" />
      </div>

      {/* Body rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-4 pt-3 border-t border-[var(--border-default)]",
            i % 2 === 0 ? "animate-shimmer" : "opacity-60 animate-shimmer"
          )}
        >
          <div className="h-3 rounded w-1/4 bg-[var(--neutral-primary-medium)]" />
          <div className="h-3 rounded w-1/5 bg-[var(--neutral-primary-medium)]" />
          <div className="h-3 rounded w-1/6 bg-[var(--neutral-primary-medium)]" />
          <div className="h-3 rounded w-1/6 bg-[var(--neutral-primary-medium)]" />
          <div className="h-3 rounded w-1/5 bg-[var(--neutral-primary-medium)]" />
        </div>
      ))}
    </div>
  );
}

/** Full page skeleton: KPI row + chart + table */
export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <KpiSkeleton />
      <ChartSkeleton />
      <TableSkeleton className="h-96" />
    </div>
  );
}
