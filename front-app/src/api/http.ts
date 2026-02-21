import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  // Token is derived from user session stored in expiresAt
  // Credentials already handled via withCredentials: true
  return config;
});
