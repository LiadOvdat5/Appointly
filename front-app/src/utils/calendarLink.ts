/**
 * Utility: calendar link generation
 *
 * Pure functions — no side effects except `downloadIcs` which triggers a browser download.
 */

export interface AppointmentCalendarData {
  /** Appointment DB id — used as the ICS UID */
  id: string;
  title: string;
  startDateTime: string; // ISO 8601
  /** Service duration in minutes */
  durationMinutes: number;
  businessName: string;
  businessAddress?: string;
  serviceName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a JS Date as YYYYMMDDTHHmmssZ (UTC, no separators) for Google / ICS */
function toCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Derive end time from start + duration */
function endDate(start: Date, durationMinutes: number): Date {
  return new Date(start.getTime() + durationMinutes * 60 * 1000);
}

// ─── Google Calendar URL ───────────────────────────────────────────────────────

/**
 * Build a Google Calendar "add event" URL.
 * No API key or OAuth needed — redirects the user to their own Google Calendar
 * with the event pre-filled.
 *
 * Title format: "[ServiceName] at [BusinessName]"
 */
export function buildGoogleCalendarUrl(
  appointment: AppointmentCalendarData,
): string {
  const start = new Date(appointment.startDateTime);
  const end = endDate(start, appointment.durationMinutes);

  const eventTitle = `${appointment.serviceName} at ${appointment.businessName}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle,
    dates: `${toCalendarDate(start)}/${toCalendarDate(end)}`,
    details: `Appointment: ${appointment.serviceName} at ${appointment.businessName}`,
    ...(appointment.businessAddress
      ? { location: appointment.businessAddress }
      : {}),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── ICS Blob ─────────────────────────────────────────────────────────────────

/**
 * Build a standard RFC 5545 `.ics` Blob suitable for Apple Calendar, Outlook,
 * and any other calendar app.
 */
export function buildIcsBlob(appointment: AppointmentCalendarData): Blob {
  const start = new Date(appointment.startDateTime);
  const end = endDate(start, appointment.durationMinutes);
  const now = new Date();

  const eventTitle = `${appointment.serviceName} at ${appointment.businessName}`;
  const uid = `${appointment.id}@bizslot`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BizSlot//BizSlot Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalendarDate(now)}`,
    `DTSTART:${toCalendarDate(start)}`,
    `DTEND:${toCalendarDate(end)}`,
    `SUMMARY:${eventTitle}`,
    `DESCRIPTION:Appointment: ${appointment.serviceName} at ${appointment.businessName}`,
    ...(appointment.businessAddress
      ? [`LOCATION:${appointment.businessAddress}`]
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // ICS spec requires CRLF line endings
  const icsContent = lines.join("\r\n");
  return new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
}

// ─── Download trigger ─────────────────────────────────────────────────────────

/** Trigger a browser download of the `.ics` file for the given appointment. */
export function downloadIcs(appointment: AppointmentCalendarData): void {
  const blob = buildIcsBlob(appointment);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "appointment.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
