"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
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
  tooltipBg: "rgba(255,255,255,0.1)",
};

// ============================================================
// Types
// ============================================================

export interface DonutChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  title: string;
  height?: number;
  loading?: boolean;
}

// ============================================================
// Custom Tooltip
// ============================================================

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { fill: string; value: number };
  }>;
  total: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  const percentage =
    total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : "0.0";

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
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
          style={{ backgroundColor: entry.payload.fill }}
        />
        <span className="font-medium" style={{ color: TOKENS.heading }}>
          {entry.name}
        </span>
      </div>
      <p style={{ color: TOKENS.body }}>
        {formatCompactNumber(entry.value)}
        <span className="ml-2" style={{ color: TOKENS.subtle }}>
          ({percentage}%)
        </span>
      </p>
    </div>
  );
}

// ============================================================
// Custom Legend
// ============================================================

function CustomLegend({
  payload,
  data,
  total,
}: {
  payload?: Array<{ value: string; color: string }>;
  data: Array<{ name: string; value: number }>;
  total: number;
}) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-3 justify-center">
      {data.map((item, i) => (
        <div
          key={item.name}
          className="flex items-center gap-1.5"
          style={{ fontSize: "14px" }}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
            style={{
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
            }}
          />
          <span style={{ color: TOKENS.body }}>{item.name}</span>
          <span className="font-medium" style={{ color: TOKENS.heading }}>
            {total > 0
              ? `${((item.value / total) * 100).toFixed(0)}%`
              : "0%"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Center Label
// ============================================================

function CenterLabel({
  viewBox,
  total,
}: {
  viewBox?: { cx: number; cy: number };
  total: number;
}) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;

  return (
    <>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: "20px",
          fontWeight: 600,
          fill: TOKENS.heading,
          fontFamily: "var(--font-lato), sans-serif",
        }}
      >
        {formatCompactNumber(total)}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: "14px",
          fill: TOKENS.subtle,
          fontFamily: "var(--font-lato), sans-serif",
        }}
      >
        Total
      </text>
    </>
  );
}

// ============================================================
// Skeleton Loader
// ============================================================

function DonutSkeleton({ height }: { height: number }) {
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

export default function DonutChart({
  data,
  title,
  height = 300,
  loading = false,
}: DonutChartProps) {
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data]
  );

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
          className="text-base font-semibold mb-4"
          style={{ color: TOKENS.heading }}
        >
          {title}
        </h3>
        <DonutSkeleton height={height} />
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
          className="text-base font-semibold mb-4"
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
        className="text-base font-semibold mb-2"
        style={{ color: TOKENS.heading }}
      >
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            isAnimationActive={true}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip total={total} />} />

          {/* Center label */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            <CenterLabel total={total} />
          </text>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <Legend
        verticalAlign="bottom"
        content={<CustomLegend data={data} total={total} />}
      />
    </div>
  );
}
