# US-12-C-01: Admin Reviews Category Requests

**Feature:** [[F-12-C-Admin-Category-Approval|F-12-C: Admin Category Approval]]
**Epic:** [[EPIC-12-Smart-Categories|EPIC-12: Smart Categories]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **review AI-generated category requests, edit the proposed name if needed, and approve or reject them** so that **only high-quality, reusable categories are added to the system**.

## Tasks
- `[BE]` Add `GET /admin/category-requests` — returns all `Pending` category requests (admin only)
- `[BE]` Add `POST /admin/category-requests/{id}/approve` — accepts optional `{ name, iconName }` overrides; creates the new `Category` and notifies the requester
- `[BE]` Add `POST /admin/category-requests/{id}/reject` — marks the request `Rejected` and optionally notifies the requester
- `[BE]` On approval, update the requesting business's category to the newly created one
- `[FE]` Create a minimal admin panel at `/admin/categories` (protected, admin role only)
- `[FE]` List pending requests: requester name, description, AI-suggested name, date
- `[FE]` Approve button with optional name/icon edit before confirming
- `[FE]` Reject button with optional reason

## Acceptance Criteria
- [x] Admin can see all pending category requests in one place
- [x] Admin can edit the AI-suggested name before approving
- [x] Approving creates the category and it immediately appears in the category list for all users
- [x] Requester's business/service is updated to use the new category on approval
- [x] Rejecting marks the request as rejected (requester can try again or pick an existing category)
