# US-02-D-01: Owner-Only Edit

**Feature:** [[F-02-D-Business-Authorization|F-02-D: Business Authorization]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As the **system**, I want to **ensure only the business owner can edit their own business** so that **business data is protected from unauthorized modification**.

## Tasks
- `[BE]` On all `PUT` and `DELETE` endpoints for a business, check that `OwnerId == currentUserId`
- `[BE]` Return HTTP 403 Forbidden if the check fails
- `[BE]` Apply the same check to service management endpoints (`PUT /services/{id}`, `DELETE /services/{id}`)

## Acceptance Criteria
- [ ] Any user who is not the business owner receives a 403 response on PUT/DELETE requests
- [ ] The business owner can always edit their own business without restriction
- [ ] Authorization check applies consistently to all business and service modification endpoints
