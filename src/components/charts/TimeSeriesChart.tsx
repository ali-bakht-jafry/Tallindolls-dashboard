"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { formatCurrency, formatCompactNumber, cn } from "@/lib/utils";

// ============================================================
// Design Tokens
// ============================================================

const CHART_COLORS = [
  "#D94FB0",
  "#8B5CF6",
  "#38BDF8",
  "#14B8A6",
  "#FB923C",
  "#22D3EE",
  "#D946EF",
  "#6366F1",
];

const TOKENS = {
  cardBg: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.1)",
  heading: "#FFFFFF",
  body: "#a1a1aa",
  subtle: "#6B7280",
  magenta: "#D94FB0",
  purple: "#8B5CF6",
  tooltipBg: "rgba(255,255,255,0.1)",
  gridStroke: "rgba(255,255,255,0.1)",
};

// ============================================================
// Types
// ============================================================

export interface TimeSeriesMetric {
  key: string;
  label: string;
  color?: string;
  format?: "currency" | "number" | "percent";
}

export interface TimeSeriesChartProps {
  data: Array<{ date: string; [key: string]: number | string }>;
  metrics: TimeSeriesMetric[];
  height?: number;
  title?: string;
  loading?: boolean;
}

// ============================================================
// Helpers
// ============================================================

function formatMetricValue(
  value: number,
  formatType?: "currency" | "number" | "percent"
): string {
  switch (formatType) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
      return formatCompactNumber(value);
    default:
      return formatCompactNumber(value);
  }
}

function parseDate(str: string): Date {
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

// ============================================================
// Gradient Definitions
// ============================================================

function ChartGradients({ metrics }: { metrics: TimeSeriesMetric[] }) {
  return (
    <defs>
      {metrics.map((metric, i) => {
        const color = metric.color || CHART_COLORS[i % CHART_COLORS.length];
        return (
          <linearGradient
            key={metric.key}
            id={`gradient-${metric.key}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="50%" stopColor={color} stopOpacity={0.08} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        );
      })}
    </defs>
  );
}

// ============================================================
// Custom Tooltip
// ============================================================

function CustomTooltip({
  active,
  payload,
  label,
  metrics,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  metrics: TimeSeriesMetric[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const formattedDate = label
    ? format(parseDate(label), "MMM dd, yyyy")
    : "";

  return (
    <div
      className="rounded-[2px] px-3 py-3 text-sm"
      style={{
        backgroundColor: TOKENS.tooltipBg,
        border: `1px solid ${TOKENS.border}`,
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        color: TOKENS.heading,
      }}
    >
      <p className="mb-2 font-medium" style={{ color: TOKENS.subtle }}>
        {formattedDate}
      </p>
      {payload.map((entry) => {
        const metric = metrics.find((m) => m.key === entry.name);
        return (
          <div key={entry.name} className="flex items-center gap-2 py-0.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: TOKENS.body }}>
              {metric?.label ?? entry.name}:
            </span>
            <span
              className="ml-auto font-medium"
              style={{ color: TOKENS.heading }}
            >
              {formatMetricValue(entry.value, metric?.format)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Custom Legend
// ============================================================

function CustomLegend({
  payload,
  metrics,
}: {
  payload?: Array<{ value: string; color: string }>;
  metrics: TimeSeriesMetric[];
}) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
      {payload.map((entry) => {
        const metric = metrics.find((m) => m.key === entry.value);
        return (
          <div
            key={entry.value}
            className="flex items-center gap-1.5"
            style={{ fontSize: "14px", color: TOKENS.body }}
          >
            <span
              className="inline-block w-3 h-0.5 rounded-[2px] shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span>{metric?.label ?? entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Skeleton Loader
// ============================================================

function TimeSeriesSkeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded-[2px]"
      style={{
        height: `${height}px`,
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
    />
  );
}

// ============================================================
// Main Component
// ============================================================

export default function TimeSeriesChart({
  data,
  metrics,
  height = 320,
  title,
  loading = false,
}: TimeSeriesChartProps) {
  const keyedMetrics = useMemo(
    () => new Map(metrics.map((m) => [m.key, m])),
    [metrics]
  );

  // Loading state
  if (loading) {
    return (
      <div
        className="rounded-[2px] p-6"
        style={{
          backgroundColor: TOKENS.cardBg,
          border: `1px solid ${TOKENS.border}`,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
        }}
      >
        {title && (
          <h3
            className="text-base font-semibold mb-4"
            style={{ color: TOKENS.heading }}
          >
            {title}
          </h3>
        )}
        <TimeSeriesSkeleton height={height} />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-[2px] p-6"
        style={{
          backgroundColor: TOKENS.cardBg,
          border: `1px solid ${TOKENS.border}`,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
        }}
      >
        {title && (
          <h3
            className="text-base font-semibold mb-4"
            style={{ color: TOKENS.heading }}
          >
            {title}
          </h3>
        )}
        <div
          className="flex items-center justify-center text-sm"
          style={{ height: `${height}px`, color: TOKENS.subtle }}
        >
          No data available
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[2px] p-6"
      style={{
        backgroundColor: TOKENS.cardBg,
        border: `1px solid ${TOKENS.border}`,
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
      }}
    >
      {title && (
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: TOKENS.heading }}
        >
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <ChartGradients metrics={metrics} />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={TOKENS.gridStroke}
            strokeOpacity={0.3}
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: TOKENS.subtle }}
            tickLine={false}
            axisLine={{ stroke: TOKENS.border }}
            tickFormatter={(val: string) => {
              try {
                return format(parseDate(val), "MMM dd");
              } catch {
                return val;
              }
            }}
            minTickGap={40}
          />

          <YAxis
            tick={{ fontSize: 12, fill: TOKENS.subtle }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => formatCompactNumber(val)}
            width={52}
          />

          <Tooltip
            content={<CustomTooltip metrics={metrics} />}
            cursor={{
              stroke: TOKENS.border,
              strokeDasharray: "4 4",
            }}
          />

          <Legend
            verticalAlign="bottom"
            content={<CustomLegend metrics={metrics} />}
          />

          {metrics.map((metric, i) => {
            const color = metric.color || CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${metric.key})`}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: color,
                  strokeWidth: 2,
                  fill: TOKENS.heading,
                }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
