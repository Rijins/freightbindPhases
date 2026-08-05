import Badge from "./Badge";
import { useRoleTheme } from "../../contexts/RoleThemeContext";

/** Role chip colored from the current user's role theme. */
const RoleBadge = ({ role, className = "" }) => {
  const roleTheme = useRoleTheme();

  return (
    <Badge
      dot
      tone="custom"
      className={`${roleTheme.primary.softBg} ${roleTheme.primary.softText} ${className}`}
    >
      {role}
    </Badge>
  );
};

export default RoleBadge;