# US-17-B-02: Customer – Booking Flow Tutorial

**Feature:** [[F-17-B-Customer-Tutorial|F-17-B: Customer Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **new customer**, I want **a guided tutorial the first time I enter the booking flow** so that **I understand how to pick a service, date, and time and confirm my appointment**.

## Tutorial Steps
1. **Service selection** — "Choose the service you want to book."
2. **Date picker** — "Pick a date — only available dates are shown."
3. **Time slot** — "Select an available time slot."
4. **Summary** — "Review your booking details before confirming."
5. **Confirm** — "Tap Confirm to book your appointment. You'll receive a confirmation."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="booking" steps={...} />` to `BookingPage`
- `[FE]` Add i18n keys: `tutorials.booking.*` in all language files

## Acceptance Criteria
- [x] Tutorial shows the first time a customer enters the booking flow
- [x] Steps match the actual booking flow UI
