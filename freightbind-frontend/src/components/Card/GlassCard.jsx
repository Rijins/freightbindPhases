import { cn } from "../../utils/cn";

/**
 * Translucent glass surface. Uses backdrop blur plus a soft white tint so it
 * reads as premium glass in light mode and dark mode without fighting either.
 */
const GlassCard = ({ children, className = "", padded = true, ...rest }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-[20px] border border-white/40 bg-white/60 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
      padded ? "p-5" : "",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

export default GlassCard;