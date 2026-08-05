import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { fadeInUp, staggerContainer } from "../../animations";

const COLUMN_CLASSES = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  12: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

/**
 * DashboardGrid — responsive CSS-grid shell with a configurable column count
 * and per-cell stagger entrance. Widgets mount as cells that fade up; use
 * `sizes` (parallel to children) with Tailwind span utilities (e.g.
 * "sm:col-span-2") to make specific widgets span multiple columns.
 *
 * Props: children, columns (1|2|3|4|12), sizes [string], gap, className.
 */
const DashboardGrid = ({ children, columns = 3, sizes = [], gap = "gap-5", className = "" }) => {
  const gridClass = COLUMN_CLASSES[columns] || COLUMN_CLASSES[3];
  const items = Array.isArray(children) ? children : [children].filter(Boolean);

  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
      className={cn("grid grid-cols-1", gridClass, gap, className)}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          className={cn("min-w-0", sizes[i])}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardGrid;