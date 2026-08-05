import { useSelector } from "react-redux";

/** Thin convenience wrapper around the auth slice for components. */
const useAuth = () => {
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);
  return { user, token, isAuthenticated, loading, error };
};

export default useAuth;
