import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { BusinessProfile } from "../../types/business";

type BusinessState = {
  ownedBusiness: BusinessProfile | null;
  ownedBusinesses: BusinessProfile[];
  isLoading: boolean;
  error: string | null;
};

const initialState: BusinessState = {
  ownedBusiness: null,
  ownedBusinesses: [],
  isLoading: false,
  error: null,
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setOwnedBusiness(state, action: PayloadAction<BusinessProfile>) {
      state.ownedBusiness = action.payload;
      // Keep ownedBusinesses in sync — add if not already present
      const exists = state.ownedBusinesses.some((b) => b.id === action.payload.id);
      if (!exists) {
        state.ownedBusinesses.push(action.payload);
      }
      state.error = null;
    },
    setOwnedBusinesses(state, action: PayloadAction<BusinessProfile[]>) {
      state.ownedBusinesses = action.payload;
      state.error = null;
    },
    setBusinessError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearBusiness(state) {
      state.ownedBusiness = null;
      state.ownedBusinesses = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setOwnedBusiness,
  setOwnedBusinesses,
  setBusinessError,
  clearBusiness,
} = businessSlice.actions;

export default businessSlice.reducer;
