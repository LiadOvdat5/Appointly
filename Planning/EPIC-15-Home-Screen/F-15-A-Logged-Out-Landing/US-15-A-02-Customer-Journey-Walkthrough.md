# US-15-A-02: Customer Journey Walkthrough

**Feature:** [[F-15-A-Logged-Out-Landing|F-15-A: Logged-Out Landing Page]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## Story
As a **potential customer**, I want to **see how easy it is to book an appointment** so that **I feel confident enough to sign up**.

## Tasks
- `[FE]` Build a "For Customers" section with a 3-step visual flow: **Sign Up → Search a Business → Book an Appointment**
- `[FE]` Each step gets an icon, a short title, and 1–2 sentence description of what happens at that step
- `[FE]` Include a secondary CTA at the bottom of the section: "Get Started for Free" (→ `/register?role=Customer`)
- `[FE]` Highlight key customer capabilities as bullet features: browse by category, map view, see available slots, instant confirmation

## Acceptance Criteria
- [x] Three steps are shown in order with distinct icons/visuals
- [x] Each step description is clear and jargon-free
- [x] CTA links to the registration page with the Customer role pre-selected
- [x] Section is skipped / hidden for authenticated users
