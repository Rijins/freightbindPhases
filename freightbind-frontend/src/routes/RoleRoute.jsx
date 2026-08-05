import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Frontend-only convenience gate: hides pages the user's role shouldn't see.
 * This NEVER replaces backend authorization — the API rejects unauthorized
 * requests regardless of what this route allows through.
 */
const RoleRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
