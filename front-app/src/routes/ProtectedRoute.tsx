import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectIsAuthenticated } from "../redux/authSelectors";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAuth?: boolean; // true = must be logged in, false = must be logged out
  redirectTo?: string;
};

/**
 * Protected Route wrapper component
 * - requireAuth={true} (default): User must be logged in, redirects to /login if not
 * - requireAuth={false}: User must be logged out, redirects to home if logged in (for login/register pages)
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // If route requires auth but user is not logged in
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If route requires NO auth (like login page) but user IS logged in
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
