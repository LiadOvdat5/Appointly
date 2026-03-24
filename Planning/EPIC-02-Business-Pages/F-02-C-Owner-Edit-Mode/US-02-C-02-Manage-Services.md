# US-02-C-02: Manage Services

**Feature:** [[F-02-C-Owner-Edit-Mode|F-02-C: Owner Edit Mode]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **add, edit, and delete services** so that **my service list is always accurate and up to date**.

## Tasks
- `[BE]` Implement `POST /businesses/{id}/services` to add a new service
- `[BE]` Implement `PUT /services/{id}` to update an existing service
- `[BE]` Implement `DELETE /services/{id}` to remove a service
- `[FE]` Build service management panel visible in edit mode with add/edit/delete controls

## Acceptance Criteria
- [ ] New services appear on the public page immediately after saving
- [ ] Deleted services are removed from the page immediately
- [ ] Price and duration fields enforce valid numeric values
- [ ] Only the business owner can manage services for their business
