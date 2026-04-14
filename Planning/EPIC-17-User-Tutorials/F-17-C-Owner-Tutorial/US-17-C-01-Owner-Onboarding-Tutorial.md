# US-17-C-01: Owner – Onboarding Wizard Tutorial

**Feature:** [[F-17-C-Owner-Tutorial|F-17-C: Business Owner Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** 🔲 Not Started

---

## Story
As a **new business owner**, I want **a guided introduction on the onboarding wizard** so that **I understand what information I need to provide to set up my business**.

## Tutorial Steps
1. **Welcome** — "Let's set up your business profile. It only takes a few minutes."
2. **Business name & category** — "Give your business a name and pick the category that fits best."
3. **Location** — "Add your address so customers can find you."
4. **Services** — "Add the services you offer — name, duration, and price."
5. **Finish** — "That's it! You can always update these details later from your dashboard."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="onboarding" steps={...} />` to `OnboardingPage`
- `[FE]` Tutorial starts on step 1 of the wizard automatically for new owners
- `[FE]` Add i18n keys: `tutorials.onboarding.*`

## Acceptance Criteria
- [ ] Tutorial is shown the first time the owner visits `/onboarding`
- [ ] Steps are in sync with the wizard step they describe
