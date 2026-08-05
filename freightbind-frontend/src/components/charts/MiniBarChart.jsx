import { useMemo, useState } from "react";
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
const BAR_GAP = 6;
const BAR_MIN_HEIGHT = 3;

/**
 * MiniBarChart — dependency-free SVG bar chart for compact dashboard
 * previews. Bars grow in on mount and show a hover tooltip. No chart
 * library is required.
 *
 * Props: data [{ label, value }], loading, color (hex), height, label,
 *   emptyTitle, emptyDescription, className.
 */
const MiniBarChart = ({
  data = [],
  loading = false,
  color,
  height = DEFAULT_HEIGHT,
  label = "Bar chart",
  emptyTitle = "No data available",
  emptyDescription = "Values will appear here as soon as data is available.",
  className = "",
}) => {
  const roleTheme = useRoleTheme();
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartColor = color || roleTheme.primary.chart;

  const bars = useMemo(() => {
    const values = data.map((d) => Number(d.value) || 0);
    const max = Math.max(...values, 1);
    const plotWidth = DEFAULT_WIDTH - PAD_X * 2;
    const slot = plotWidth / (values.length || 1);
    const barWidth = Math.max(slot - BAR_GAP, 2);
    return values.map((value, index) => ({
      x: PAD_X + index * slot + (slot - barWidth) / 2,
      width: barWidth,
      raw: value,
      normalized: Math.max(BAR_MIN_HEIGHT, (value / max) * (height - PAD_Y * 2)),
    }));
  }, [data, height]);

  const handleHover = (event) => {
    if (bars.length === 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const index = Math.min(Math.max(Math.floor(ratio * bars.length), 0), bars.length - 1);
    setHoverIndex(index);
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
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800",
          className
        )}
        style={{ height }}
      >
        <EmptyState title={emptyTitle} description={emptyDescription} size="sm" />
      </div>
    );
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null;
  const tooltipLeft = hoverIndex != null ? ((bars[hoverIndex].x + bars[hoverIndex].width / 2) / DEFAULT_WIDTH) * 100 : 0;

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
        {bars.map((bar, index) => (
          <motion.rect
            key={index}
            x={bar.x}
            width={bar.width}
            y={height - PAD_Y - bar.normalized}
            rx={Math.min(bar.width / 2, 5)}
            fill={chartColor}
            opacity={hoverIndex === null || hoverIndex === index ? 0.9 : 0.3}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: hoverIndex === null || hoverIndex === index ? 0.9 : 0.3 }}
            transition={{ duration: 0.3, ease: EASE, delay: index * 0.03 }}
            style={{ transformOrigin: `${bar.x + bar.width / 2}px ${height - PAD_Y}px` }}
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

export default MiniBarChart;
