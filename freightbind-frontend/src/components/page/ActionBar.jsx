import { cn } from "../../utils/cn";

const JUSTIFY_CLASSES = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

/**
 * Action bar — clusters buttons and tools in a row that wraps on small
 * screens. Use `left` and `right` for split layouts, `children` for a single
 * group.
 */
const ActionBar = ({ children, left, right, justify = "end", className = "" }) => (
  <div className={cn("flex flex-wrap items-center gap-2", JUSTIFY_CLASSES[justify], className)}>
    {left}
    {children}
    {right}
  </div>
);

export default ActionBar;