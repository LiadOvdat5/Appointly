import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsAuthenticated,
  selectAuthStatus,
  selectUser,
} from "../redux/authSelectors";
import { Role } from "../constants/roles";

type AdminRouteProps = {
  children: React.ReactNode;
};

/**
 * AdminRoute — only allows users with Role.Admin to access the wrapped content.
 * - Loading: shows spinner while auth is resolving.
 * - Not authenticated: redirects to /login.
 * - Authenticated but not admin: shows inline 403 "Access Denied" page.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectUser);

  if (authStatus === "unknown") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== Role.Admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white">
        <span className="text-6xl font-bold text-slate-300 dark:text-slate-600">
          403
        </span>
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-slate-500 dark:text-slate-400">
          You do not have permission to access the admin panel.
        </p>
        <a
          href="/"
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Go to home
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
