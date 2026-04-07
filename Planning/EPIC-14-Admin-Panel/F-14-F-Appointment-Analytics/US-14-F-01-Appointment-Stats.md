# US-14-F-01: Platform-Wide Appointment Analytics

**Feature:** [[F-14-F-Appointment-Analytics|F-14-F: Admin Appointment Analytics]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **see analytics for all appointments on the platform** so that **I can understand booking volume, completion rates, cancellation trends, and which businesses are most active**.

---

## Tasks

### Backend
- `[BE]` `GET /admin/appointments/analytics` — returns the full analytics payload:
  - `totalAppointments` — all-time count
  - `byStatus` — breakdown: `{ booked, completed, cancelled, noShow }`
  - `completionRate` — percentage of appointments that were `Completed` (out of all non-pending)
  - `cancellationRate` — percentage that were `Cancelled`
  - `topBusinessesByVolume` — top 10 businesses by total appointment count: `[ { businessId, name, slug, count } ]`
  - `topBusinessesByCompletion` — top 5 businesses with highest completion rate (min 5 appointments): `[ { businessId, name, slug, rate } ]`
  - `appointmentsByMonth` — last 12 months: `[ { month: "2025-03", count } ]`

### Frontend
- `[FE]` New page `AdminAppointmentsPage.tsx` at `/admin/appointments`
- `[FE]` Summary stat cards row: Total, Booked, Completed, Cancelled
- `[FE]` Completion rate + cancellation rate displayed as percentage badges
- `[FE]` "Top Businesses by Volume" — ranked list (top 10) with appointment counts and links to `/admin/businesses`
- `[FE]` "Top Businesses by Completion Rate" — ranked list (top 5) with rate %
- `[FE]` "Appointments by Month" — last 12 months shown as a simple bar chart (CSS-based, no charting library)
- `[FE]` Wire the existing "Appointments" card on `AdminDashboardPage` to `/admin/appointments`
- `[FE]` Register `/admin/appointments` route in `routes.tsx`

---

## Data Shape (Backend Response)

```json
{
  "totalAppointments": 1240,
  "byStatus": {
    "booked": 312,
    "completed": 741,
    "cancelled": 163,
    "noShow": 24
  },
  "completionRate": 78.4,
  "cancellationRate": 13.1,
  "topBusinessesByVolume": [
    { "businessId": "...", "name": "Fade Factory", "slug": "fade-factory", "count": 198 }
  ],
  "topBusinessesByCompletion": [
    { "businessId": "...", "name": "Glow Nails", "slug": "glow-nails", "rate": 96.2 }
  ],
  "appointmentsByMonth": [
    { "month": "2025-05", "count": 87 },
    { "month": "2025-06", "count": 103 }
  ]
}
```

---

## Acceptance Criteria
- [x] All counts and rates reflect live DB data
- [x] `byStatus` covers all four statuses (zero counts shown, not omitted)
- [x] Monthly chart covers exactly the last 12 calendar months, padded with 0 for months with no appointments
- [x] Top businesses lists link or visually reference the business (name + slug)
- [x] Page is accessible only to users with `admin` role
- [x] Loading skeleton shown while data fetches
- [x] Error state shown if the API call fails
