# US-18-A-03: .ics File Export (Apple Calendar / Outlook Fallback)

**Feature:** [[F-18-A-Google-Calendar-Export|F-18-A: Add to Google Calendar]]
**Epic:** [[EPIC-18-Calendar-Integration|EPIC-18: Calendar Integration]]
**Status:** 🔲 Not Started

---

## Story
As a **user who does not use Google Calendar**, I want to **download a standard .ics calendar file** so that **I can import the appointment into Apple Calendar, Outlook, or any other calendar app**.

## Tasks
- `[FE]` Implement `buildIcsBlob(appointment: AppointmentCalendarData): Blob` in `src/utils/calendarLink.ts`
- `[FE]` ICS format: `VCALENDAR` > `VEVENT` with `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`, `LOCATION`, `UID`
- `[FE]` Trigger download: create a temporary `<a>` element with `href=URL.createObjectURL(blob)` and `download="appointment.ics"`
- `[FE]` No backend endpoint needed — generated entirely in the browser

## Acceptance Criteria
- [ ] Downloaded `.ics` file imports correctly into Apple Calendar
- [ ] Downloaded `.ics` file imports correctly into Outlook
- [ ] Event details match the appointment (time, duration, title, location)
- [ ] UID is unique per appointment (use appointmentId in the UID field)
