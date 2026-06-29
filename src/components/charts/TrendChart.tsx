"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { formatCurrency, formatCompactNumber, cn } from "@/lib/utils";

// ============================================================
// Design Tokens
// ============================================================

const TOKENS = {
  cardBg: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.1)",
  heading: "#FFFFFF",
  body: "#a1a1aa",
  subtle: "#6B7280",
  magenta: "#D94FB0",
  tooltipBg: "rgba(255,255,255,0.1)",
  gridStroke: "rgba(255,255,255,0.1)",
};

// ============================================================
// Types
// ============================================================

export interface TrendChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  format?: "currency" | "number" | "percent";
  color?: string;
  height?: number;
  loading?: boolean;
}

// ============================================================
// Linear Regression
// ============================================================

function simpleLinearRegression(
  data: Array<{ date: string; value: number }>
): Array<{ date: string; value: number; trend: number }> {
  if (data.length < 2) {
    return data.map((d) => ({ ...d, trend: d.value }));
  }

  const n = data.length;
  const meanX = (n - 1) / 2;
  const meanY = data.reduce((sum, d) => sum + d.value, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const dx = i - meanX;
    numerator += dx * (data[i].value - meanY);
    denominator += dx * dx;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  return data.map((d, i) => ({
    ...d,
    trend: intercept + slope * i,
  }));
}

// ============================================================
// Helpers
// ============================================================

function parseDate(str: string): Date {
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatValue(
  value: number,
  fmt?: "currency" | "number" | "percent"
): string {
  switch (fmt) {
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

// ============================================================
// Custom Tooltip
// ============================================================

function CustomTooltip({
  active,
  payload,
  label,
  fmt,
  color,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  fmt?: "currency" | "number" | "percent";
  color: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const actual = payload.find((p) => p.name === "value");
  const trend = payload.find((p) => p.name === "trend");
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
      {actual && (
        <div className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
            style={{ backgroundColor: color }}
          />
          <span style={{ color: TOKENS.body }}>Actual:</span>
          <span
            className="ml-auto font-medium"
            style={{ color: TOKENS.heading }}
          >
            {formatValue(actual.value, fmt)}
          </span>
        </div>
      )}
      {trend && (
        <div className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0 border border-dashed"
            style={{ borderColor: color, backgroundColor: "transparent" }}
          />
          <span style={{ color: TOKENS.subtle }}>Trend:</span>
          <span
            className="ml-auto font-medium"
            style={{ color: TOKENS.subtle }}
          >
            {formatValue(trend.value, fmt)}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Skeleton Loader
// ============================================================

function TrendSkeleton({ height }: { height: number }) {
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

export default function TrendChart({
  data,
  title,
  format: fmt = "number",
  color = TOKENS.magenta,
  height = 260,
  loading = false,
}: TrendChartProps) {
  const enrichedData = useMemo(
    () => simpleLinearRegression(data),
    [data]
  );

  const gradientId = `trend-grad-${title.replace(/[^a-zA-Z0-9]/g, "-")}`;

  // Loading state
  if (loading) {
    return (
      <div
        className="rounded-[2px] p-5"
        style={{
          backgroundColor: TOKENS.cardBg,
          border: `1px solid ${TOKENS.border}`,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
        }}
      >
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: TOKENS.heading }}
        >
          {title}
        </h3>
        <TrendSkeleton height={height} />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-[2px] p-5"
        style={{
          backgroundColor: TOKENS.cardBg,
          border: `1px solid ${TOKENS.border}`,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
        }}
      >
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: TOKENS.heading }}
        >
          {title}
        </h3>
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
      className="rounded-[2px] p-5"
      style={{
        backgroundColor: TOKENS.cardBg,
        border: `1px solid ${TOKENS.border}`,
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
      }}
    >
      <h3
        className="text-base font-semibold mb-3"
        style={{ color: TOKENS.heading }}
      >
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={enrichedData}
          margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
        >
          {/* Area gradient */}
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="50%" stopColor={color} stopOpacity={0.06} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>

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
            axisLine={false}
            tickFormatter={(val: string) => {
              try {
                return format(parseDate(val), "M/d");
              } catch {
                return val;
              }
            }}
            minTickGap={50}
          />

          <YAxis
            tick={{ fontSize: 12, fill: TOKENS.subtle }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => formatCompactNumber(val)}
            width={48}
          />

          <Tooltip
            content={<CustomTooltip fmt={fmt} color={color} />}
            cursor={{
              stroke: TOKENS.border,
              strokeDasharray: "4 4",
            }}
          />

          {/* Main area with gradient fill */}
          <Area
            type="monotone"
            dataKey="value"
            name="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              stroke: color,
              strokeWidth: 2,
              fill: TOKENS.heading,
            }}
          />

          {/* Dashed linear regression trend line */}
          <Line
            type="monotone"
            dataKey="trend"
            name="trend"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={false}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Footer legend */}
      <div
        className="flex items-center justify-center gap-6 mt-2"
        style={{ fontSize: "14px", color: TOKENS.body }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-0.5 rounded-[2px] shrink-0"
            style={{ backgroundColor: color }}
          />
          Actual
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 border-t border-dashed shrink-0"
            style={{ borderColor: color }}
          />
          Trend
        </div>
      </div>
    </div>
  );
}
