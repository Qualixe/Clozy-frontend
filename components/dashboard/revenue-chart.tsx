"use client";

import * as React from "react";

export type RevenuePoint = { date: string; revenue: number };

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function formatShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const maxValue = niceMax(Math.max(...data.map((d) => d.revenue), 0));
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const xFor = (i: number) =>
    PAD_LEFT + (data.length === 1 ? 0 : (i / (data.length - 1)) * plotWidth);
  const yFor = (v: number) => PAD_TOP + plotHeight - (v / maxValue) * plotHeight;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(d.revenue)}`)
    .join(" ");
  const areaPath = `${linePath} L${xFor(data.length - 1)},${PAD_TOP + plotHeight} L${xFor(0)},${PAD_TOP + plotHeight} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxValue * f));

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const latest = data[data.length - 1];

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Revenue over time"
      >
        {/* Gridlines */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yFor(tick)}
              y2={yFor(tick)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px]"
            >
              ${tick}
            </text>
          </g>
        ))}

        {/* X-axis labels (sparse) */}
        {data.map((d, i) => {
          const showEvery = Math.ceil(data.length / 6);
          if (i % showEvery !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={d.date}
              x={xFor(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {formatShortDate(d.date)}
            </text>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} className="fill-foreground/10" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          className="stroke-foreground"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End label */}
        <circle
          cx={xFor(data.length - 1)}
          cy={yFor(latest.revenue)}
          r={4}
          className="fill-foreground stroke-background"
          strokeWidth={2}
        />

        {/* Crosshair */}
        {hovered && (
          <>
            <line
              x1={xFor(hoverIndex!)}
              x2={xFor(hoverIndex!)}
              y1={PAD_TOP}
              y2={PAD_TOP + plotHeight}
              className="stroke-border"
              strokeWidth={1}
            />
            <circle
              cx={xFor(hoverIndex!)}
              cy={yFor(hovered.revenue)}
              r={4}
              className="fill-foreground stroke-background"
              strokeWidth={2}
            />
          </>
        )}

        {/* Hit layer */}
        <rect
          x={PAD_LEFT}
          y={PAD_TOP}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-lg border border-border bg-background px-3 py-2 shadow-sm"
          style={{
            left: `${(xFor(hoverIndex!) / WIDTH) * 100}%`,
          }}
        >
          <p className="text-xs text-muted-foreground">
            {formatShortDate(hovered.date)}
          </p>
          <p className="text-sm font-semibold text-foreground">
            ${hovered.revenue}
          </p>
        </div>
      )}
    </div>
  );
}

export default RevenueChart;
