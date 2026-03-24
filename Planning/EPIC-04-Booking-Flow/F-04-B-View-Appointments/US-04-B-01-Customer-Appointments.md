# US-04-B-01: Customer Appointments

**Feature:** [[F-04-B-View-Appointments|F-04-B: View Appointments]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ BE Done / 🔲 FE Pending

---

## Story
As a **customer**, I want to **see a list of my upcoming appointments** so that **I can keep track of when and where my bookings are**.

## Tasks
- `[BE]` Implement `GET /appointments?clientId={id}` returning the customer's appointments
- `[FE]` Display the appointment list in the Customer Dashboard, sorted by date ascending
- `[FE]` Show: business name, service, date/time, and status for each appointment

## Acceptance Criteria
- [ ] Appointments are sorted by date ascending (soonest first)
- [ ] Past appointments are not shown in this view
- [ ] Empty state message is displayed if there are no upcoming appointments
- [ ] Each appointment shows the correct business name, service, date, and time
