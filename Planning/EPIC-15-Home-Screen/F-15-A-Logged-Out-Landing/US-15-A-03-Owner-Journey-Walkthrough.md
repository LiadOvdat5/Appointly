# US-15-A-03: Business Owner Journey Walkthrough

**Feature:** [[F-15-A-Logged-Out-Landing|F-15-A: Logged-Out Landing Page]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** 🔲 Not Started

---

## Story
As a **potential business owner**, I want to **see how to list my business and start accepting bookings** so that **I understand the value and decide to sign up**.

## Tasks
- `[FE]` Build a "For Business Owners" section with a 4-step visual flow: **Sign Up → Create Your Business → Add Services & Schedule → Start Getting Customers**
- `[FE]` Each step gets an icon, a short title, and 1–2 sentence description
- `[FE]` Include a secondary CTA: "List Your Business" (→ `/register?role=BusinessOwner`)
- `[FE]` Highlight key owner capabilities as bullet features: custom business page, service & pricing management, schedule control, appointments dashboard, analytics

## Acceptance Criteria
- [ ] Four steps are shown in order with distinct icons/visuals
- [ ] Each step description explains the concrete action the owner takes
- [ ] CTA links to registration with BusinessOwner role pre-selected
- [ ] Section is skipped / hidden for authenticated users
