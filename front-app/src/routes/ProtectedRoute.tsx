import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectIsAuthenticated, selectAuthStatus } from "../redux/authSelectors";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAuth?: boolean; // true = must be logged in, false = must be logged out
  redirectTo?: string;
};

/**
 * Protected Route wrapper component
 * - requireAuth={true} (default): User must be logged in, redirects to /login if not
 * - requireAuth={false}: User must be logged out, redirects to home if logged in (for login/register pages)
 * - While auth status is "unknown" (initial app load), renders a spinner instead of redirecting.
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector(selectAuthStatus);

  // Auth is still being resolved (e.g. AuthBootstrap hasn't finished the /me call).
  // Don't redirect yet — show a neutral loading screen.
  if (authStatus === "unknown") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

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
