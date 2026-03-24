# US-06-A-03: Cancel from Dashboard

**Feature:** [[F-06-A-Business-Dashboard|F-06-A: Business Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **cancel an appointment directly from my dashboard** so that **I can manage unexpected changes without navigating away**.

## Tasks
- `[BE]` Reuse `PUT /appointments/{id}/cancel` (see [[US-04-C-02-Owner-Cancel|US-04-C-02]])
- `[FE]` Add "Cancel" action button to each appointment row in the Business Dashboard
- `[FE]` Show a confirmation dialog before submitting the cancellation
- `[FE]` Remove the canceled appointment from the list immediately on success

## Acceptance Criteria
- [ ] Canceled appointment is removed from the upcoming appointments list immediately
- [ ] A confirmation dialog is shown before the cancellation is submitted
- [ ] API error is shown if the cancellation fails
