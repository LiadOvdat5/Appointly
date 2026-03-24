# US-02-A-02: Onboarding Wizard

**Feature:** [[F-02-A-Create-Business|F-02-A: Create Business]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 FE Pending

---

## Story
As a **new business owner**, I want to **be guided through a multi-step setup wizard** so that **I can configure my business, services, and schedule in a structured and intuitive way**.

## Tasks
- `[FE]` Build multi-step onboarding wizard: Step 1 — Business Info, Step 2 — Add Services, Step 3 — Set Schedule
- `[FE]` Validate each step before allowing progression to the next
- `[FE]` Implement a "Back" button to return to previous steps
- `[FE]` Auto-save or persist wizard progress in local state so data is not lost if user navigates away

## Acceptance Criteria
- [ ] Each step validates required fields before the user can proceed
- [ ] User can navigate back to a previous step without losing entered data
- [ ] Incomplete wizard state is preserved during the session
- [ ] Completing all steps creates the business and redirects to the business page or dashboard
