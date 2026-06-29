"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Design Tokens
// ============================================================

const TOKENS = {
  heading: "#FFFFFF",
  body: "#a1a1aa",
  subtle: "#6B7280",
  magenta: "#D94FB0",
  arcBg: "rgba(255,255,255,0.1)",
};

// ============================================================
// Types
// ============================================================

export interface MetricGaugeProps {
  value: number;
  max: number;
  title: string;
  unit?: string;
  color?: string;
  size?: number;
}

// ============================================================
// Main Component
// ============================================================

export default function MetricGauge({
  value,
  max,
  title,
  unit = "",
  color = TOKENS.magenta,
  size = 140,
}: MetricGaugeProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const strokeWidth = size * 0.071; // ~10px at 140 size
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semi-circle (180deg)
  const filledLength = (percentage / 100) * circumference;
  const center = size / 2;

  // Gap between start and end of the semi-circle arc
  // Arc path: starts at 180deg (left), sweeps to 360deg/0deg (right)
  // We use a path for the semi-circle arcs
  const arcPath = useMemo(() => {
    const r = radius;
    const cx = center;
    const cy = center;

    // Semi-circle from 180deg (left) to 0deg (right), going clockwise through top
    const startX = cx - r;
    const startY = cy;
    const endX = cx + r;
    const endY = cy;

    return `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
  }, [radius, center]);

  const transitionStyle = "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Title below gauge */}
      <span
        className="font-medium pb-1"
        style={{ fontSize: "14px", color: TOKENS.body }}
      >
        {title}
      </span>

      {/* Gauge */}
      <div className="relative" style={{ width: size, height: size - strokeWidth }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {/* Background arc (semi-circle) */}
          <path
            d={arcPath}
            fill="none"
            stroke={TOKENS.arcBg}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Foreground arc (progress) */}
          <path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference}`}
            style={{ transition: transitionStyle }}
          />
        </svg>

        {/* Center text overlay */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            top: `${strokeWidth * 1.5}px`,
            left: 0,
            width: `${size}px`,
            height: `${size - strokeWidth * 3}px`,
          }}
        >
          <span
            className="font-semibold leading-none"
            style={{
              fontSize: `${Math.round(size * 0.17)}px`,
              color: TOKENS.heading,
              fontFamily: "var(--font-lato), sans-serif",
            }}
          >
            {value}
            {unit}
          </span>
          <span
            className="mt-1"
            style={{
              fontSize: "14px",
              color: TOKENS.subtle,
            }}
          >
            / {max}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
