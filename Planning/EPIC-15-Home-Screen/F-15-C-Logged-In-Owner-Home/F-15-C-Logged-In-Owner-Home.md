# F-15-C: Logged-In Business Owner Home

**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-15-C-01-Owner-Greeting\|US-15-C-01]] | Owner greeting with business name | ✅ Done |
| [[US-15-C-02-Todays-Appointments-Widget\|US-15-C-02]] | Today's appointments preview | ✅ Done |
| [[US-15-C-03-Quick-Actions\|US-15-C-03]] | Quick action links | ✅ Done |

## Notes

- Rendered at `/` when `isAuthenticated === true` and `role === 'BusinessOwner'`.
- If the owner has no business yet, show a prompt to complete onboarding instead of the widgets.
- Reuses existing API endpoints where possible.
