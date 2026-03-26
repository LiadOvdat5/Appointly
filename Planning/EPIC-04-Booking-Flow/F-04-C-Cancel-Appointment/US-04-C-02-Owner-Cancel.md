# US-04-C-02: Owner Cancel

**Feature:** [[F-04-C-Cancel-Appointment|F-04-C: Cancel Appointment]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **cancel any appointment for my business from the dashboard** so that **I can manage unexpected schedule changes**.

## Tasks
- `[BE]` Reuse `PUT /appointments/{id}/cancel` endpoint, gated by business ownership check
- `[FE]` Add cancel action to each appointment row in the Business Dashboard appointment list
- `[FE]` Show a confirmation dialog before submitting

## Acceptance Criteria
- [x] Business owner can cancel any appointment associated with their business
- [x] Other users cannot cancel appointments for a business they do not own (403)
- [x] Canceled appointment is removed from the active appointments list immediately
- [ ] Future: customer should receive a notification when their appointment is canceled by the owner
