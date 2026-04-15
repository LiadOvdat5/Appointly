# US-17-A-01: Tutorial Step Engine and UI

**Feature:** [[F-17-A-Tutorial-Framework|F-17-A: Tutorial Framework]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **developer**, I want **a reusable tutorial component** so that **any page can define a sequence of tooltip steps that highlight UI elements and guide the user**.

## Tasks
- `[FE]` Evaluate and adopt a lightweight spotlight/tooltip library (e.g., `intro.js`, `react-joyride`, or a custom Tailwind-based implementation)
- `[FE]` Create a `<Tutorial>` component that accepts an array of steps: `{ target: string, title: i18nKey, body: i18nKey, placement? }`
- `[FE]` Each step highlights the target element with a spotlight overlay and shows a tooltip with title, body, Back/Next/Skip buttons
- `[FE]` Tutorial auto-starts when the component mounts if the page has not been seen
- `[FE]` Steps are accessible: tooltip is `role="dialog"`, focus trapped inside, `aria-live` announces step changes
- `[FE]` Progress indicator (e.g., "Step 2 of 5") shown on each tooltip

## Acceptance Criteria
- [ ] Tutorial renders steps sequentially with back/next navigation
- [ ] Spotlight correctly highlights the target element
- [ ] Fully keyboard accessible (Tab between buttons, Escape = skip)
- [ ] Screen readers announce step content
- [ ] Works on mobile (tooltip repositions to avoid overflow)
