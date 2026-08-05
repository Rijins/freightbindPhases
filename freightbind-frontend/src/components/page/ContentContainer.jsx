import { cn } from "../../utils/cn";

const WIDTHS = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-7xl",
};

/** Constrained content wrapper for forms and panels narrower than the page. */
const ContentContainer = ({ children, size = "xl", className = "", ...rest }) => (
  <div className={cn("mx-auto w-full", WIDTHS[size] || WIDTHS.xl, className)} {...rest}>
    {children}
  </div>
);

export default ContentContainer;