# US-17-C-03: Owner – Business Page Edit Mode Tutorial

**Feature:** [[F-17-C-Owner-Tutorial|F-17-C: Business Owner Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want **a tutorial the first time I enter edit mode on my business page** so that **I know how to update my logo, banner, services, and theme**.

## Tutorial Steps
1. **Edit mode** — "You're now editing your public business page. Changes are saved as you go."
2. **Logo & banner** — "Upload your logo and a banner image to make your page stand out."
3. **Theme color** — "Pick a color to personalize your business page."
4. **Services list** — "Add, edit, or remove the services you offer here."
5. **Preview** — "Exit edit mode to see how customers will see your page."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="business-edit" steps={...} />` to the edit mode view of `BusinessPage`
- `[FE]` Add i18n keys: `tutorials.businessEdit.*`

## Acceptance Criteria
- [ ] Tutorial shows the first time the owner enters edit mode
- [ ] Does not re-show on subsequent edit mode entries
