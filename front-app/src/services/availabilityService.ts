import { apiClient } from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeeklyRuleDTO {
  id: string;
  serviceId: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  isWorkingDay: boolean;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  createdAt: string;
}

export interface BreakRuleDTO {
  id: string;
  serviceId: string;
  dayOfWeek: number | null; // null = applies to all days
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface DateExceptionDTO {
  id: string;
  serviceId: string;
  date: string;        // ISO date string "YYYY-MM-DDT..."
  isWorkingDay: boolean;
  startTime: string | null;  // "HH:mm:ss"
  endTime: string | null;    // "HH:mm:ss"
  reason: string | null;
  createdAt: string;
}

export interface GenerateSlotsResult {
  totalSlotsCreated: number;
  averageSlotsPerDay: number;
  generationStartDate: string;
  generationEndDate: string;
  daysInRange: number;
  message: string;
}

// ─── Weekly Working Rules ─────────────────────────────────────────────────────

export const getWeeklyRules = (serviceId: string): Promise<WeeklyRuleDTO[]> =>
  apiClient
    .get<WeeklyRuleDTO[]>(`/api/availability/service/${serviceId}/weekly-rules`)
    .then((r) => r.data);

export const createWeeklyRule = (dto: {
  serviceId: string;
  dayOfWeek: number;
  isWorkingDay: boolean;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
}): Promise<WeeklyRuleDTO> =>
  apiClient.post<WeeklyRuleDTO>("/api/availability/weekly-rule", dto).then((r) => r.data);

export const updateWeeklyRule = (
  ruleId: string,
  dto: { isWorkingDay?: boolean; startTime?: string; endTime?: string },
): Promise<WeeklyRuleDTO> =>
  apiClient
    .put<WeeklyRuleDTO>(`/api/availability/weekly-rule/${ruleId}`, dto)
    .then((r) => r.data);

export const deleteWeeklyRule = (ruleId: string): Promise<void> =>
  apiClient.delete(`/api/availability/weekly-rule/${ruleId}`).then(() => undefined);

// ─── Break Rules ──────────────────────────────────────────────────────────────

export const getBreakRules = (serviceId: string): Promise<BreakRuleDTO[]> =>
  apiClient
    .get<BreakRuleDTO[]>(`/api/availability/service/${serviceId}/break-rules`)
    .then((r) => r.data);

export const createBreakRule = (dto: {
  serviceId: string;
  dayOfWeek: number;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
}): Promise<BreakRuleDTO> =>
  apiClient.post<BreakRuleDTO>("/api/availability/break-rule", dto).then((r) => r.data);

export const deleteBreakRule = (ruleId: string): Promise<void> =>
  apiClient.delete(`/api/availability/break-rule/${ruleId}`).then(() => undefined);

// ─── Date Exceptions ──────────────────────────────────────────────────────────

export const getDateExceptions = (serviceId: string): Promise<DateExceptionDTO[]> =>
  apiClient
    .get<DateExceptionDTO[]>(`/api/availability/service/${serviceId}/date-exceptions`)
    .then((r) => r.data);

export const createDateException = (dto: {
  serviceId: string;
  date: string;        // "YYYY-MM-DDT00:00:00"
  isWorkingDay: boolean;
  startTime?: string;  // "HH:mm:ss" — for working-day exceptions
  endTime?: string;    // "HH:mm:ss"
  reason?: string;
}): Promise<DateExceptionDTO> =>
  apiClient.post<DateExceptionDTO>("/api/availability/date-exception", dto).then((r) => r.data);

export const deleteDateException = (exceptionId: string): Promise<void> =>
  apiClient.delete(`/api/availability/date-exception/${exceptionId}`).then(() => undefined);

// ─── Recurring Rules ──────────────────────────────────────────────────────────

export interface RecurringRuleDTO {
  id: string;
  serviceId: string;
  startDate: string;  // ISO datetime
  endDate: string;    // ISO datetime
  daysOfWeek: string; // JSON array string e.g. "[0,1,2,3,4]"
  startTime: string;  // "HH:MM:SS"
  endTime: string;    // "HH:MM:SS"
  createdAt: string;
}

export const getRecurringRules = (serviceId: string): Promise<RecurringRuleDTO[]> =>
  apiClient
    .get<RecurringRuleDTO[]>(`/api/availability/service/${serviceId}/recurring-rules`)
    .then((r) => r.data);

export const createRecurringRule = (dto: {
  serviceId: string;
  startDate: string;  // ISO datetime
  endDate: string;    // ISO datetime
  daysOfWeek: string; // JSON array string
  startTime: string;  // "HH:mm:ss"
  endTime: string;    // "HH:mm:ss"
}): Promise<RecurringRuleDTO> =>
  apiClient.post<RecurringRuleDTO>("/api/availability/recurring-rule", dto).then((r) => r.data);

export const deleteRecurringRule = (ruleId: string): Promise<void> =>
  apiClient.delete(`/api/availability/recurring-rule/${ruleId}`).then(() => undefined);

// ─── Slot Generation ──────────────────────────────────────────────────────────

export const generateSlots = (
  serviceId: string,
  startDate: string, // "YYYY-MM-DD"
  endDate: string,   // "YYYY-MM-DD"
): Promise<GenerateSlotsResult> =>
  apiClient
    .post<GenerateSlotsResult>(
      `/api/schedule/service/${serviceId}/generate-slots-range`,
      { startDate, endDate },
    )
    .then((r) => r.data);
