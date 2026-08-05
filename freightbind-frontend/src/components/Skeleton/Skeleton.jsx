import { cn } from "../../utils/cn";

/**
 * Skeleton primitive — a shimmering placeholder that adopts the surrounding
 * shape through `className`. Base is designed to play well inside cards,
 * tables and forms.
 */
const Skeleton = ({ className = "", ...rest }) => (
  <div
    aria-hidden="true"
    className={cn(
      "animate-shimmer rounded-md bg-slate-200/80 dark:bg-zinc-700/60",
      className
    )}
    {...rest}
  />
);

export default Skeleton;