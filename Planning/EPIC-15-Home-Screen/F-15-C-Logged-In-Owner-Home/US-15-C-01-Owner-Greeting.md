# US-15-C-01: Owner Greeting with Business Name

**Feature:** [[F-15-C-Logged-In-Owner-Home|F-15-C: Logged-In Business Owner Home]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## Story
As a **logged-in business owner**, I want to **see a greeting that references my business** so that **the home screen immediately contextualises my workspace**.

## Tasks
- `[FE]` Display "Hello, {firstName}!" at the top; show business name as subtitle if the owner has an active business (fetch from `GET /businesses?ownerId={id}` or the existing business slice)
- `[FE]` If no business exists yet: show "Welcome! Ready to list your business?" with a "Complete Setup" button (→ `/onboarding`)
- `[FE]` If business exists: show business name as a clickable link (→ `/business/{id}`)

## Acceptance Criteria
- [x] Greeting shows the owner's first name
- [x] Business name subtitle appears when the owner has a business
- [x] Onboarding prompt appears when the owner has no business
- [x] Business name links to the public business page
