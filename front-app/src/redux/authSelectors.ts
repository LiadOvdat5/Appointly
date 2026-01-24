import type { RootState } from "./store";

export const selectAuth = (state: RootState) => state.auth;

export const selectUser = (state: RootState) => state.auth.user;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === "authenticated";

export const selectAuthStatus = (state: RootState) => state.auth.status;

export const selectExpiresAt = (state: RootState) => state.auth.expiresAt;
