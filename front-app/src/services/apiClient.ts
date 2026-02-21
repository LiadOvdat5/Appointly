/**
 * API Client
 * Wrapper around axios for making API calls
 * Uses the existing http instance from http.ts
 */

import { http } from "../api/http";

export const apiClient = http;
