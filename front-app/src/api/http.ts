import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/store";
import { clearSession, setSession } from "../redux/authSlice";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Silent refresh interceptor ────────────────────────────────────────────────
// When any request returns 401 we attempt one silent POST /auth/refresh.
// If that succeeds the server sets new HttpOnly cookies and we retry the
// original request transparently.  If the refresh itself returns 401 (expired /
// revoked token) we clear the Redux session and redirect to /login.
// Any other refresh failure (5xx, network error, timeout) is treated as a
// transient server issue — we do NOT clear the session, so the user isn't
// bounced to /login during a cold start (e.g. Azure SQL auto-pause wake-up).
//
// Concurrent 401s are queued: only one refresh call is ever in-flight at a
// time and all waiting requests are retried (or rejected) once it resolves.

let isRefreshing = false;

type QueueEntry = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};
let refreshQueue: QueueEntry[] = [];

function drainQueue(error: unknown) {
  refreshQueue.forEach((entry) =>
    error ? entry.reject(error) : entry.resolve(undefined),
  );
  refreshQueue = [];
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh");
    const alreadyRetried = originalRequest?._retried;

    // Don't attempt refresh if: not a 401, already retried, or it IS the
    // refresh endpoint (avoids infinite loop)
    if (!is401 || isRefreshEndpoint || alreadyRetried) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    if (isRefreshing) {
      // Another refresh is already in flight — queue this request
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => http(originalRequest));
    }

    isRefreshing = true;

    try {
      const res = await http.post<{
        user: { id: string; name: string; role: number; businessId?: string };
        expiresAt: string;
      }>("/auth/refresh", null);

      const { user, expiresAt } = res.data;
      store.dispatch(
        setSession({
          user,
          expiresAt: new Date(expiresAt).getTime(),
        }),
      );

      drainQueue(null);
      return http(originalRequest);
    } catch (refreshError) {
      drainQueue(refreshError);
      // Only a 401 from the refresh endpoint means the token is genuinely
      // expired/revoked. Network errors and 5xx are transient — preserve the
      // session so the user isn't kicked to /login on a server cold start.
      if ((refreshError as AxiosError).response?.status === 401) {
        store.dispatch(clearSession());
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
