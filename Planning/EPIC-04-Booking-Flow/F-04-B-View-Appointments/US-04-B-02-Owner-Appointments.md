# US-04-B-02: Owner Appointments

**Feature:** [[F-04-B-View-Appointments|F-04-B: View Appointments]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ BE Done / 🔲 FE Pending

---

## Story
As a **business owner**, I want to **see all upcoming appointments for my business** so that **I can prepare and manage my schedule**.

## Tasks
- `[BE]` Implement `GET /appointments?businessId={id}` (or `workerId={id}`) returning the business's appointments
- `[FE]` Display the appointment list in the Business Dashboard
- `[FE]` Show: customer name, service, date/time for each appointment
- `[FE]` Add date filter to allow viewing by specific date range

## Acceptance Criteria
- [ ] Appointment list shows customer name, service, and date/time
- [ ] List is filterable by date range
- [ ] Canceled appointments are excluded from the default view
- [ ] Only the business owner can access their business's appointment list
