import { useLocation } from "react-router-dom";
import { resolveModuleAccent } from "../utils/themeTokens";

/** Maps the current route to its module accent (accent-only, never page-wide). */
export const useModuleAccent = () => {
  const location = useLocation();
  return resolveModuleAccent(location.pathname);
};

export default useModuleAccent;
