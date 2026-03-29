# F-06-B: Customer Dashboard

**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** ✅ Done

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-06-B-01-Customer-Upcoming-Appointments\|US-06-B-01]] | See upcoming appointments | ✅ Done |
| [[US-06-B-02-Booking-History\|US-06-B-02]] | See booking history / analytics | ✅ Done |
| [[US-06-B-03-Customer-Cancel\|US-06-B-03]] | Cancel appointment (redirect to My Appointments) | ✅ Done |
| [[US-06-B-04-Followed-Businesses\|US-06-B-04]] | See followed businesses | 🔲 Placeholder (depends on EPIC-07) |

## Notes

- Dashboard lives at `/customer-dashboard` (analytics + preview + quick links)
- Full appointments list (view + cancel) remains at `/dashboard/customer`
- Analytics powered by `GET /api/reports/customer` with date range filter
