// ─── Shared types for ScheduleEditorPage and its sub-components ──────────────

export interface DeleteWindowParams {
  fromDate: Date;
  toDate: Date;
  dayOfWeek?: number; // 0=Mon … 6=Sun
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
}

export interface ImpactInfo {
  freeSlotCount: number;
  bookedCount: number;
  deletionPlans: DeleteWindowParams[];
  infoMessages: string[];
}

export interface BreakEntry {
  id: string | null;  // null = new (not yet saved)
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  deleted: boolean;   // true = pending deletion on next save
}

export interface DayState {
  dayOfWeek: number;   // 0 = Monday … 6 = Sunday
  ruleId: string | null;
  isOpen: boolean;
  hasHours: boolean;   // whether a time range has been entered
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  breaks: BreakEntry[];
}
