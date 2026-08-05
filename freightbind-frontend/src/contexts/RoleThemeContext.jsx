import { createContext, useContext, useMemo } from "react";
import useAuth from "../hooks/useAuth";
import { ROLES } from "../utils/constants";
import { ROLE_THEMES } from "../utils/themeTokens";

const RoleThemeContext = createContext(ROLE_THEMES[ROLES.ADMIN]);

/**
 * Provides the current user's role theme to every component that needs
 * role-colored surfaces. No component ever hardcodes role colors — they
 * consume `useRoleTheme()` tokens instead.
 */
export const RoleThemeProvider = ({ children }) => {
  const { user } = useAuth();

  const theme = useMemo(
    () => ROLE_THEMES[user?.role] || ROLE_THEMES[ROLES.ADMIN],
    [user?.role]
  );

  return <RoleThemeContext.Provider value={theme}>{children}</RoleThemeContext.Provider>;
};

export const useRoleTheme = () => useContext(RoleThemeContext);
