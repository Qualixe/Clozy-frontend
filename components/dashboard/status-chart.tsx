"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type StatusPoint = {
  label: string;
  count: number;
  tone: "good" | "warning" | "critical";
};

const TONE_CLASSES: Record<StatusPoint["tone"], string> = {
  good: "fill-emerald-500",
  warning: "fill-amber-500",
  critical: "fill-destructive",
};

const WIDTH = 320;
const HEIGHT = 220;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;
const BAR_WIDTH = 24;

export function StatusChart({ data }: { data: StatusPoint[] }) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.count), 1);
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = WIDTH / data.length;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Orders by status"
      >
        <line
          x1={0}
          x2={WIDTH}
          y1={PAD_TOP + plotHeight}
          y2={PAD_TOP + plotHeight}
          className="stroke-border"
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const barHeight = (d.count / maxValue) * plotHeight;
          const x = slot * i + slot / 2 - BAR_WIDTH / 2;
          const y = PAD_TOP + plotHeight - barHeight;
          const isHovered = hovered === i;

          return (
            <g
              key={d.label}
              className="cursor-pointer"
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${d.count} orders`}
            >
              {/* Larger transparent hit target */}
              <rect
                x={slot * i}
                y={PAD_TOP}
                width={slot}
                height={plotHeight}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={Math.max(barHeight, 2)}
                rx={4}
                className={cn(TONE_CLASSES[d.tone], isHovered && "opacity-80")}
              />
              <text
                x={x + BAR_WIDTH / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-medium"
              >
                {d.count}
              </text>
              <text
                x={x + BAR_WIDTH / 2}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default StatusChart;
