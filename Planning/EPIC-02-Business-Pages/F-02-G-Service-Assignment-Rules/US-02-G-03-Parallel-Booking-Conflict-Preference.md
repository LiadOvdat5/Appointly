# US-02-G-03: Configure Parallel Booking Conflict Preference

**Feature:** [[F-02-G-Service-Assignment-Rules|F-02-G: Service Assignment Rules & Parallel Booking]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **choose whether booking a slot on one service automatically blocks the matching slot on another service assigned to the same staff member** so that **I don't accidentally double-book a person who can only handle one appointment at a time**.

## Context
When a staff member is assigned to two or more services and those services have overlapping available time slots, a booking on Service A theoretically still leaves Service B open — but the same person cannot fulfill both. This preference ("block on booking", default **on**) can be toggled per service and is stored on the service's assignment record. When a booked appointment is cancelled or rescheduled, the auto-blocked slots on sibling services are released automatically.

**Terminology:**
- **Sibling services** — two or more services assigned to the same staff member
- **Block-on-booking** — the preference flag; `true` (default) means booking Service A auto-blocks the same time slot on all sibling services
- **Auto-blocked slot** — an `AvailabilitySlot` marked as `BlockedByConflict` (new status value) that is released if the originating booking is cancelled

## Tasks

### Database
- `[DB]` Add `BlockOnBooking` (bool, default `true`) column to `Services` table
- `[DB]` Add `BlockedByConflict` variant to the `SlotStatus` enum (or equivalent status field on `AvailabilitySlots`)
- `[DB]` Add `BlockingAppointmentId` (nullable FK → `Appointments.Id`) on `AvailabilitySlots` — tracks which appointment caused this slot to be blocked (used for auto-release)
- `[DB]` Create EF Core migration

### Backend
- `[BE]` When an appointment is created: if the booked service's `BlockOnBooking` is `true`, find all sibling services (same `AssignedStaffId`), locate their `AvailabilitySlot`s that overlap with the booked time window, and mark them `BlockedByConflict` with `BlockingAppointmentId` set
- `[BE]` When an appointment is cancelled or rescheduled: find all `AvailabilitySlots` where `BlockingAppointmentId` matches the cancelled appointment, and restore them to `Available`
- `[BE]` Update `GET /businesses/{id}/services/{id}/availability` — exclude `BlockedByConflict` slots from the public response
- `[BE]` Expose `blockOnBooking` in the service DTO (read and write)
- `[BE]` Add `PATCH /businesses/{businessId}/services/{serviceId}/assignment/preferences` — body `{ blockOnBooking: boolean }` — owner only

### Frontend
- `[FE]` When the owner assigns a second (or later) service to a staff member, show a dialog/step explaining the conflict preference:
  - Title: "How should overlapping slots be handled?"
  - Description: "If [Staff Name] gets booked for [Service A], do you want to automatically block the matching time slot for [Service B]?"
  - Toggle: "Block the other slot when one is booked" — default **on**
  - Confirm / Cancel buttons
- `[FE]` Save the chosen `blockOnBooking` value for the newly assigned service
- `[FE]` This dialog is skipped when assigning the first (and only) service to a staff member

## Acceptance Criteria
- [ ] `BlockOnBooking` defaults to `true` for every new service
- [ ] Booking an appointment on Service A with `BlockOnBooking = true` blocks the same time window on all sibling services assigned to the same staff
- [ ] Cancelling or rescheduling the originating appointment releases the auto-blocked sibling slots
- [ ] Customers cannot see or book `BlockedByConflict` slots
- [ ] When assigning a 2nd+ service to a staff member, a dialog prompts for the block-on-booking preference before saving
- [ ] The preference can be changed later via the Services & Hours page (US-02-G-04)
