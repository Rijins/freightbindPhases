import Button from "./Button";

const ICON_BUTTON_SIZES = {
  sm: { className: "h-8 w-8 px-0", icon: 16 },
  md: { className: "h-9 w-9 px-0", icon: 18 },
  lg: { className: "h-10 w-10 px-0", icon: 20 },
};

/**
 * Square, icon-only button built on the shared Button system so variant,
 * focus ring and loading behaviour stay identical.
 */
const IconButton = ({
  icon: Icon,
  label,
  size = "md",
  variant = "ghost",
  tooltip,
  className = "",
  ...rest
}) => {
  const { className: sizeClasses, icon: iconSize } = ICON_BUTTON_SIZES[size];
  return (
    <Button
      variant={variant}
      size="md"
      className={`${sizeClasses} ${className}`}
      aria-label={label}
      title={tooltip || label}
      {...rest}
    >
      <Icon size={iconSize} aria-hidden="true" />
    </Button>
  );
};

export default IconButton;