import { cn } from "../../utils/cn";

/**
 * Responsive page container — consistent horizontal padding and an optional
 * max-width. Pages that render inside AppLayout's own wrapper can pass
 * maxW="none" to avoid double constraints.
 */
const PageContainer = ({ children, className = "", maxW = "7xl", ...rest }) => (
  <div
    className={cn("mx-auto w-full px-4 sm:px-6 md:px-8", maxW === "none" ? "" : `max-w-${maxW}`, className)}
    {...rest}
  >
    {children}
  </div>
);

export default PageContainer;