export function formatTime(iso: string, timezone?: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
}
