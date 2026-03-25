# US-02-A-02: Onboarding Wizard

**Feature:** [[F-02-A-Create-Business|F-02-A: Create Business]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **new business owner**, I want to **be guided through a multi-step setup wizard** so that **I can configure my business, services, and schedule in a structured and intuitive way**.

## Tasks
- `[FE]` ✅ Build multi-step onboarding wizard at `/onboarding`:
  - Step 1 — Business Info (name, address, phone, description) → `POST /businesses`
  - Step 2 — Add Services (name, description, duration, price, category) → `POST /businesses/:id/services` per service
  - Step 3 — Completion screen → navigate to `/dashboard`
- `[FE]` ✅ Validate each step before allowing progression to the next
- `[FE]` ✅ Back button returns to Step 1 without losing entered data
- `[FE]` ✅ Session refreshed after business creation so Redux reflects the new Owner role
- `[FE]` ✅ Entry point added to `CustomerLandingPage` ("Do you own a business?" banner for Role.Client)
- `[FE]` ✅ Entry point added to `RoleSidebar` ("Create your business" link for Role.Client)

> **Note:** Step 3 (Set Schedule) was scoped out of the initial wizard — schedule configuration is handled from the business dashboard (EPIC-03 FE).

## Acceptance Criteria
- [x] Each step validates required fields before the user can proceed
- [x] User can navigate back to a previous step without losing entered data
- [x] Wizard state (businessId, form fields) is preserved in component state during the session
- [x] Completing all steps creates the business + at least one service, then redirects to `/dashboard`
