# F-14-F: Admin Appointment Analytics

**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Goal
Give admins a clear view of appointment health across the entire platform — not a list of every appointment, but meaningful analytics: volumes, statuses, trends, and top performers.

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-14-F-01-Appointment-Stats\|US-14-F-01]] | View platform-wide appointment analytics | 🔲 Not Started |

---

## Routes

| Path | Page |
|------|------|
| `/admin/appointments` | `AdminAppointmentsPage.tsx` |

---

## Notes
- The "Appointments" card on the admin dashboard (already present) links to `/admin/appointments` — this feature wires it up.
- No raw appointment list — only aggregated analytics are shown.
- All data served by a single `GET /admin/appointments/analytics` endpoint.
