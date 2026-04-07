# F-14-G: Admin Review Analytics

**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** 🔲 Not Started

---

## Goal
Give admins insight into the review landscape across the platform — not a raw list of every review, but aggregated analytics: totals, platform average, top-rated businesses, most-reviewed businesses, and flag activity.

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-14-G-01-Review-Stats\|US-14-G-01]] | View platform-wide review analytics | 🔲 Not Started |

---

## Routes

| Path | Page |
|------|------|
| `/admin/reviews` | `AdminReviewsPage.tsx` |

---

## Notes
- The existing "Reviews" card on the admin dashboard currently links to `/admin/flagged-reviews` — this feature changes it to link to `/admin/reviews` (the analytics page), which then has a prominent link to the flagged reviews moderation queue.
- The "Flagged Reviews" card remains unchanged and still links directly to `/admin/flagged-reviews`.
- No raw review list — only aggregated analytics are shown.
- All data served by a single `GET /admin/reviews/analytics` endpoint.
