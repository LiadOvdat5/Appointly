# US-02-G-05: Informational Banner on Staff Management for Multi-Service Staff

**Feature:** [[F-02-G-Service-Assignment-Rules|F-02-G: Service Assignment Rules & Parallel Booking]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see an informational message in the Staff Management detail view when a staff member (or myself) is assigned to two or more services with potentially overlapping slots** so that **I understand how parallel booking conflicts are being handled and where to change the preference if needed**.

## Context
The Staff Management detail view (opened by clicking a staff card) already shows the staff member's assigned services. When the list shows ≥ 2 services, a contextual banner should explain the parallel booking behavior in plain language and link directly to the Services & Hours page for adjustments. This is read-only on this page — the actual toggle lives in US-02-G-04.

## Tasks

### Frontend
- `[FE]` In the staff detail panel, when the staff member has **2 or more assigned services**, render an info banner below the services list:

  > **Parallel booking protection is active**
  > When one of [Staff Name]'s services gets booked, the same time slot is automatically blocked on their other services. This prevents double-booking.
  > To change this behaviour for a specific service, go to [Services & Hours →] *(link/button that navigates to the Services & Hours page)*

- `[FE]` If `blockOnBooking` is `false` for **any** of the staff member's services, adjust the banner text to:

  > **Parallel booking protection is partially off**
  > One or more of [Staff Name]'s services do not automatically block overlapping slots when booked. Review the settings on [Services & Hours →]

- `[FE]` The banner is hidden when the staff member has 0 or 1 assigned service
- `[FE]` The banner uses the existing info/warning UI chip or alert component from the design system

### Backend
- `[BE]` No new endpoints — the staff detail endpoint should already return the services list with their `blockOnBooking` values (ensure this field is included in the response DTO)

## Acceptance Criteria
- [ ] The info banner appears in the staff detail panel only when the staff member has ≥ 2 services
- [ ] Banner text reflects whether protection is fully on, partially off, or fully off
- [ ] Banner includes a navigation link/button to the Services & Hours page
- [ ] The banner is absent when the staff member has 0 or 1 service
- [ ] The owner's detail panel follows the same banner logic as any staff member
