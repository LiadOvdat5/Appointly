# US-14-E-02: Suspend / Reactivate a Business

**Feature:** [[F-14-E-Business-Moderation|F-14-E: Business Moderation]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** 🔲 Not Started

---

## Story
As an **admin**, I want to **suspend a business** so that **it no longer appears in search results or accepts new bookings while under investigation**.

## Tasks
- `[DB]` Add `IsSuspended` (bool, default false) and `SuspendedReason` (nullable string) to `Businesses` table; migration
- `[BE]` `POST /admin/businesses/{businessId}/suspend` — sets `IsSuspended = true`
- `[BE]` `POST /admin/businesses/{businessId}/reactivate` — clears suspension
- `[BE]` Update search: exclude `IsSuspended = true` businesses from search results
- `[BE]` Update `GET /businesses/{id}`: return `410 Gone` (or a suspension message) for suspended businesses
- `[FE]` Suspend / Reactivate button in the business list row
- `[FE]` Suspended business's public page shows "This business is temporarily unavailable" to visitors

## Acceptance Criteria
- [ ] Suspended businesses do not appear in search results
- [ ] Visiting the public page of a suspended business shows a suspension notice
- [ ] Admin can reactivate a suspended business and it reappears in search
- [ ] Suspension reason is stored and visible in the admin panel
