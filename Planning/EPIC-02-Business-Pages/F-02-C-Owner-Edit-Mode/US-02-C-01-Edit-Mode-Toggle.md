# US-02-C-01: Edit Mode Toggle

**Feature:** [[F-02-C-Owner-Edit-Mode|F-02-C: Owner Edit Mode]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **toggle Edit Mode on my business page** so that **I can make inline changes to my business information without leaving the page**.

## Tasks
- `[FE]` Show "Edit" toggle button only when the authenticated user is the business owner
- `[FE]` On toggle, switch name, description, and contact info fields to editable inputs
- `[BE]` Implement `PUT /businesses/{id}` accepting `UpdateBusinessDTO`
- `[FE]` "Save" button submits changes; "Cancel" reverts to read-only view

## Acceptance Criteria
- [ ] Only the owner of the business sees the Edit Mode toggle
- [ ] Customers and unauthenticated users never see the edit button or editable fields
- [ ] Changes are saved on confirm and immediately reflected in the page
- [ ] Cancel reverts all unsaved changes
