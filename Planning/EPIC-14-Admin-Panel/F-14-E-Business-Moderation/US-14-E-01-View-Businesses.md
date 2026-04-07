# US-14-E-01: View All Businesses

**Feature:** [[F-14-E-Business-Moderation|F-14-E: Business Moderation]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **browse all registered businesses** so that **I can spot and act on businesses that violate platform policies**.

## Tasks
- `[BE]` `GET /admin/businesses?search=&page=&pageSize=` — paginated list with: id, name, owner name, category, review count, avg rating, isSuspended, createdAt
- `[FE]` Admin page at `/admin/businesses` with searchable, paginated table
- `[FE]` Clicking a business row opens its public page in a new tab

## Acceptance Criteria
- [x] All businesses are listed with name, owner, category, rating, and suspension status
- [x] Search by business name works
- [x] Suspended businesses are visually distinguished
