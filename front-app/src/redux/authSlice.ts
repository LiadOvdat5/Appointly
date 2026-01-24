import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  name: string;
  role: number;
};

type AuthStatus = "unknown" | "authenticated" | "guest";

type AuthState = {
  user: AuthUser | null;
  expiresAt: number | null; // epoch ms
  status: AuthStatus;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  expiresAt: null,
  status: "unknown", // on app load, we don't know yet
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ user: AuthUser; expiresAt: number }>,
    ) {
      state.user = action.payload.user;
      state.expiresAt = action.payload.expiresAt;
      state.status = "authenticated";
      state.error = null;
    },
    setGuest(state) {
      state.user = null;
      state.expiresAt = null;
      state.status = "guest";
      state.error = null;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearSession(state) {
      state.user = null;
      state.expiresAt = null;
      state.status = "guest";
      state.error = null;
    },
  },
});

export const { setSession, setGuest, setAuthError, clearSession } =
  authSlice.actions;

export default authSlice.reducer;
