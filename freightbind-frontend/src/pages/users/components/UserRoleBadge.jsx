import Badge from "../../../components/Badges/Badge";
import { ROLE_THEMES } from "../../../utils/themeTokens";
import { ROLES } from "../../../utils/constants";

/**
 * Role badge colored per the role itself (not the current user's role).
 * Uses the exact ROLE_THEMES tokens the app already defines, so light and
 * dark mode stay consistent with the rest of the product.
 */
const UserRoleBadge = ({ role }) => {
  const theme = ROLE_THEMES[role] || ROLE_THEMES[ROLES.ADMIN];

  return (
    <Badge dot tone="custom" className={`${theme.primary.softBg} ${theme.primary.softText}`}>
      {role}
    </Badge>
  );
};

export default UserRoleBadge;
