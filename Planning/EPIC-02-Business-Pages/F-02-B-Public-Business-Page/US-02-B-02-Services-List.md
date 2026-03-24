# US-02-B-02: Services List

**Feature:** [[F-02-B-Public-Business-Page|F-02-B: Public Business Page]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 FE Pending

---

## Story
As a **customer**, I want to **see the business's services with their price and duration** so that **I can choose a service to book**.

## Tasks
- `[BE]` Implement `GET /businesses/{id}/services` returning `ServiceDTO[]`
- `[FE]` Render service cards showing: name, price, duration, and a "Book" button
- `[FE]` "Book" button navigates to the booking flow with the selected service pre-loaded

## Acceptance Criteria
- [ ] All active services are displayed on the page
- [ ] Each service card shows name, price, and duration clearly
- [ ] "Book" button on each service card links to the booking flow (EPIC-04)
- [ ] Empty state is shown if the business has no services listed
