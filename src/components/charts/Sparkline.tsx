"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Design Tokens
// ============================================================

const TOKENS = {
  magenta: "#D94FB0",
};

// ============================================================
// Types
// ============================================================

export interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

// ============================================================
// Main Component
// ============================================================

export default function Sparkline({
  data,
  color = TOKENS.magenta,
  width = 120,
  height = 32,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const { points, fillPath } = useMemo(() => {
    const padding = 2;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX =
      data.length > 1
        ? (width - padding * 2) / (data.length - 1)
        : width - padding * 2;

    // Build points for the polyline
    const pts = data
      .map((val, i) => {
        const x = padding + i * stepX;
        const y =
          height - padding - ((val - min) / range) * (height - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // Build fill path: same as polyline but closes back to baseline
    const firstY =
      height - padding - ((data[0] - min) / range) * (height - padding * 2);
    const lastY =
      height -
      padding -
      ((data[data.length - 1] - min) / range) * (height - padding * 2);
    const baselineY = height - padding;

    const fillPts =
      pts +
      ` ${(padding + (data.length - 1) * stepX).toFixed(1)},${baselineY.toFixed(1)} ${padding.toFixed(1)},${baselineY.toFixed(1)}`;

    return { points: pts, fillPath: fillPts };
  }, [data, width, height]);

  const gradientId = useMemo(
    () => `sparkline-grad-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>

      {/* Subtle fill gradient below the line */}
      <polyline
        fill={`url(#${gradientId})`}
        stroke="none"
        points={fillPath}
      />

      {/* Main stroke line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
