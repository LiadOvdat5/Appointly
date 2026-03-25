import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import searchReducer from "../features/search/searchSlice";
import businessReducer from "../features/business/businessSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    business: businessReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
