# F-15-B: Logged-In Customer Home

**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-15-B-01-Customer-Greeting\|US-15-B-01]] | Personalised greeting | ✅ Done |
| [[US-15-B-02-Next-Appointment-Widget\|US-15-B-02]] | Next appointment widget | ✅ Done |
| [[US-15-B-03-Recent-Businesses-Widget\|US-15-B-03]] | Recently booked businesses | ✅ Done |
| [[US-15-B-04-Pending-Reviews-Widget\|US-15-B-04]] | Pending review prompts | ✅ Done |

## Notes

- Rendered at `/` when `isAuthenticated === true` and `role === 'Customer'`.
- Reuses existing API endpoints — no new backend work expected.
- Each widget has an empty state (no data yet) handled gracefully.
