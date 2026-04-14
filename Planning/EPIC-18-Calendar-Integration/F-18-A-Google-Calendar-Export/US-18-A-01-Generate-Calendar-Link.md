# US-18-A-01: Generate Google Calendar Link for an Appointment

**Feature:** [[F-18-A-Google-Calendar-Export|F-18-A: Add to Google Calendar]]
**Epic:** [[EPIC-18-Calendar-Integration|EPIC-18: Calendar Integration]]
**Status:** 🔲 Not Started

---

## Story
As a **developer**, I want **a utility that generates a Google Calendar event URL from appointment data** so that **any component in the app can produce a working "Add to Calendar" link without backend involvement**.

## Background
Google Calendar supports a URL scheme that pre-fills a new event:
```
https://calendar.google.com/calendar/render?action=TEMPLATE
  &text=<title>
  &dates=<startYYYYMMDDTHHmmssZ>/<endYYYYMMDDTHHmmssZ>
  &details=<description>
  &location=<address>
```
No API key or OAuth is needed — the user is redirected to their own Google Calendar with the event pre-filled.

## Tasks
- `[FE]` Create utility `src/utils/calendarLink.ts` with:
  - `buildGoogleCalendarUrl(appointment: AppointmentCalendarData): string`
  - `buildIcsBlob(appointment: AppointmentCalendarData): Blob` (for .ics export)
- `[FE]` `AppointmentCalendarData` type: `{ title, startDateTime, durationMinutes, businessName, businessAddress, serviceName }`
- `[BE]` Ensure appointment detail endpoints return `durationMinutes` and `businessAddress` (add to DTOs if missing)

## Acceptance Criteria
- [ ] `buildGoogleCalendarUrl` returns a valid, openable Google Calendar URL
- [ ] Event title format: `"[ServiceName] at [BusinessName]"`
- [ ] Event duration matches the service duration
- [ ] Business address populates the location field
- [ ] Utility has no side effects (pure function)
