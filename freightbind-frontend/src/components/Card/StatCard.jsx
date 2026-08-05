import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FiClock, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { EASE } from "../../animations";
import { MODULE_ACCENTS } from "../../utils/themeTokens";
import Skeleton from "../Skeleton/Skeleton";
import { cn } from "../../utils/cn";

const COUNT_DURATION = 600;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Reusable KPI statistics widget used by every dashboard. Backwards-compatible
 * superset of the original StatCard: existing usages are untouched, while
 * `loading`, `empty`, `animateValue`, `delta` / `previousValue` and `accent`
 * opt into the richer behaviours.
 *
 * Props: icon, title, value, trend, trendUp, lastUpdated, prefix, suffix,
 *   delta, previousValue, deltaLabel, animateValue, loading, empty,
 *   accent, hoverable, delay, className.
 */
const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendUp = true,
  lastUpdated,
  prefix = "",
  suffix = "",
  delta,
  previousValue,
  deltaLabel = "vs previous",
  animateValue = false,
  loading = false,
  empty = false,
  accent,
  hoverable = true,
  delay = 0,
  className = "",
}) => {
  const roleTheme = useRoleTheme();
  const accentToken = accent ? MODULE_ACCENTS[accent] : undefined;

  const iconTileClass = accentToken
    ? "bg-slate-100 dark:bg-zinc-800"
    : roleTheme.primary.softBg;
  const iconClass = accentToken ? accentToken.text : roleTheme.primary.softText;
  const accentBar = accentToken ? accentToken.dot : roleTheme.primary.dot;

  const isNumber = typeof value === "number" && !Number.isNaN(value);
  const hasFraction = isNumber && !Number.isInteger(value);

  const rawDelta =
    delta == null && previousValue != null
      ? Number(previousValue) === 0
        ? null
        : ((Number(value) - Number(previousValue)) / Math.abs(Number(previousValue))) * 100
      : delta;
  const percentDelta = rawDelta == null || !Number.isFinite(Number(rawDelta)) ? null : Number(rawDelta);

  const countRef = useRef(null);
  const inView = useInView(countRef, { once: true, margin: "0px 0px -40px 0px" });
  const [displayed, setDisplayed] = useState(
    animateValue && isNumber ? 0 : isNumber ? Number(value) : 0
  );
  const lastTargetRef = useRef(null);

  // Restarts the count-up whenever the target value changes; stale values
  // after a live refresh are avoided by keying the effect off `value`.
  useEffect(() => {
    if (!(animateValue && isNumber) || !inView) return;

    const target = Number(value);
    if (target === lastTargetRef.current) return;
    lastTargetRef.current = target;

    let frame;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / COUNT_DURATION, 1);
      setDisplayed(target * easeOutCubic(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animateValue, inView, isNumber, value]);

  const formatNumber = (n) =>
    Number.isNaN(Number(n))
      ? "—"
      : n.toLocaleString("en-US", { maximumFractionDigits: hasFraction ? 2 : 0 });

  const displayedValue = isNumber
    ? formatNumber(animateValue ? displayed : Number(value))
    : String(value ?? "");

  const renderedValue = empty ? "—" : `${prefix}${displayedValue}${suffix}`;

  const deltaText =
    percentDelta == null
      ? null
      : `${percentDelta >= 0 ? "+" : ""}${percentDelta.toFixed(1)}%`;

  const deltaTone =
    !deltaText
      ? ""
      : percentDelta > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : percentDelta < 0
          ? "text-red-600 dark:text-red-400"
          : "text-slate-500 dark:text-slate-400";
  const TrendIcon =
    percentDelta == null ? null : percentDelta === 0 ? null : percentDelta < 0 ? FiTrendingDown : FiTrendingUp;

  if (loading) {
    return (
      <div
        aria-busy="true"
        className={cn(
          "relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel dark:border-zinc-800 dark:bg-zinc-900",
          className
        )}
      >
        <Skeleton className="absolute inset-y-0 left-0 w-1" />
        <div className="flex items-start justify-between gap-3">
          <div className="w-full space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-3 w-2/3" />
      </div>
    );
  }

  return (
    <motion.div
      ref={countRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE, delay }}
      whileHover={hoverable ? { y: -2 } : undefined}
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel transition-shadow dark:border-zinc-800 dark:bg-zinc-900",
        hoverable && "hover:shadow-panelHover",
        className
      )}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${accentBar}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 truncate font-display text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
            {renderedValue}
          </p>
        </div>
        {Icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTileClass}`}
          >
            <Icon size={20} className={iconClass} aria-hidden="true" />
          </span>
        )}
      </div>
      {(trend || deltaText || lastUpdated) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
          {deltaText ? (
            <span
              className={cn("inline-flex items-center gap-1 font-medium", deltaTone)}
              title={`${deltaText} ${deltaLabel}`}
            >
              {TrendIcon && <TrendIcon size={13} aria-hidden="true" />}
              {deltaText}
              <span className="font-normal text-slate-400 dark:text-slate-500">{deltaLabel}</span>
            </span>
          ) : trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                trendUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {trendUp ? <FiTrendingUp size={13} aria-hidden="true" /> : <FiTrendingDown size={13} aria-hidden="true" />}
              {trend}
            </span>
          ) : (
            <span />
          )}
          {lastUpdated && (
            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <FiClock size={12} aria-hidden="true" />
              {lastUpdated}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;