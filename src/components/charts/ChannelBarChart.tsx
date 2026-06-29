"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
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
  gridStroke: "rgba(255,255,255,0.1)",
};

// ============================================================
// Types
// ============================================================

export interface ChannelBarChartProps {
  data: Array<{
    channel?: string;
    name?: string;
    label?: string;
    value?: number;
    spend?: number;
    revenue?: number;
    color?: string;
  }>;
  title: string;
  format?: "currency" | "number" | "percent";
  height?: number;
  loading?: boolean;
}

// ============================================================
// Helpers
// ============================================================

function formatValue(value: number, fmt?: string): string {
  switch (fmt) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return `${value.toFixed(1)}%`;
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
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  fmt?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

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
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span
            style={{ color: TOKENS.body }}
            className="font-medium capitalize"
          >
            {entry.name}:
          </span>
          <span
            className="ml-auto font-medium"
            style={{ color: TOKENS.heading }}
          >
            {formatValue(entry.value, fmt)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Value Label Renderer
// ============================================================

function renderValueLabel(props: any, fmt?: string) {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width + 6}
      y={y + 4}
      fill={TOKENS.body}
      fontSize={14}
      textAnchor="start"
      dominantBaseline="middle"
    >
      {formatValue(value, fmt)}
    </text>
  );
}

// ============================================================
// Skeleton Loader
// ============================================================

function BarSkeleton({ height }: { height: number }) {
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

export default function ChannelBarChart({
  data,
  title,
  format: fmt = "currency",
  height = 300,
  loading = false,
}: ChannelBarChartProps) {
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
        <BarSkeleton height={height} />
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

  // Normalize data: extract the display name
  const chartData = data.map((item) => ({
    ...item,
    channel: item.channel || item.name || item.label || "",
  }));

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

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 10, bottom: 0 }}
          barCategoryGap="25%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={TOKENS.gridStroke}
            strokeOpacity={0.3}
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: TOKENS.subtle }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => formatCompactNumber(val)}
          />

          <YAxis
            type="category"
            dataKey="channel"
            tick={{ fontSize: 14, fill: TOKENS.body, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />

          <Tooltip
            content={<CustomTooltip fmt={fmt} />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />

          <Bar
            dataKey="value"
            radius={[0, 2, 2, 0]}
            barSize={24}
            maxBarSize={32}
          >
            <LabelList
              dataKey="value"
              content={(props: any) => renderValueLabel(props, fmt)}
            />
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${entry.channel}-${index}`}
                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
