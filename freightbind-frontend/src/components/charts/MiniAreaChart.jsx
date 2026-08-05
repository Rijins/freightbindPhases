import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Skeleton from "../Skeleton/Skeleton";
import EmptyState from "../EmptyState/EmptyState";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 120;
const PAD_X = 8;
const PAD_Y = 16;

const buildGeometry = (values, height) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (DEFAULT_WIDTH - PAD_X * 2) / (values.length - 1 || 1);
  return values.map((value, index) => ({
    x: PAD_X + index * stepX,
    y: height - PAD_Y - ((value - min) / range) * (height - PAD_Y * 2),
    value,
  }));
};

const smoothPath = (points) => {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const mid = { x: (prev.x + points[i].x) / 2, y: (prev.y + points[i].y) / 2 };
    path += ` Q ${prev.x} ${prev.y} ${mid.x} ${mid.y}`;
  }
  return path;
};

const areaPath = (points, height) => {
  if (points.length < 2) return "";
  const line = smoothPath(points);
  const last = points[points.length - 1];
  return `${line} L ${last.x} ${height - PAD_Y / 2} L ${points[0].x} ${height - PAD_Y / 2} Z`;
};

/**
 * MiniAreaChart — dependency-free SVG area chart for compact dashboard
 * previews. Draws a smoothed line over a gradient area fill, animates on
 * mount, and shows a hover guide + tooltip. No chart library is required.
 *
 * Props: data [{ label, value }], loading, color (hex), height, label,
 *   emptyTitle, emptyDescription, className.
 */
const MiniAreaChart = ({
  data = [],
  loading = false,
  color,
  height = DEFAULT_HEIGHT,
  label = "Area chart",
  emptyTitle = "No data available",
  emptyDescription = "Values will appear here as soon as data is available.",
  className = "",
}) => {
  const roleTheme = useRoleTheme();
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartColor = color || roleTheme.primary.chart;

  const points = useMemo(() => buildGeometry(data.map((d) => Number(d.value) || 0), height), [data, height]);

  const handleHover = (event) => {
    if (points.length === 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const index = Math.round((ratio * (DEFAULT_WIDTH - PAD_X * 2)) / ((DEFAULT_WIDTH - PAD_X * 2) / (points.length - 1 || 1)));
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
  };

  if (loading) {
    return (
      <div aria-busy="true" className={cn("w-full", className)} style={{ height }}>
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800", className)} style={{ height }}>
        <EmptyState title={emptyTitle} description={emptyDescription} size="sm" />
      </div>
    );
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null;
  const tooltipLeft = hoverIndex != null ? (points[hoverIndex].x / DEFAULT_WIDTH) * 100 : 0;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${DEFAULT_WIDTH} ${height}`}
        className="w-full"
        role="img"
        aria-label={label}
        onMouseMove={handleHover}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {hoverIndex != null && (
          <line
            x1={points[hoverIndex].x}
            y1={PAD_Y}
            x2={points[hoverIndex].x}
            y2={height - PAD_Y}
            stroke={chartColor}
            strokeOpacity="0.35"
            strokeDasharray="3 3"
          />
        )}

        {points.length >= 2 && (
          <motion.path
            d={areaPath(points, height)}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        )}

        <motion.path
          d={smoothPath(points)}
          fill="none"
          stroke={chartColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        />

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoverIndex === index ? 4 : 2.5}
            fill={chartColor}
            opacity={hoverIndex === null || hoverIndex === index ? 1 : 0.35}
          />
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center shadow-lg dark:bg-zinc-100"
          style={{ left: `${tooltipLeft}%` }}
        >
          <p className="whitespace-nowrap text-xs font-medium text-white dark:text-slate-900">
            {hovered.label}
          </p>
          <p className="whitespace-nowrap text-[11px] text-slate-300 dark:text-slate-500">
            {hovered.value}
          </p>
        </div>
      )}
    </div>
  );
};

export default MiniAreaChart;
