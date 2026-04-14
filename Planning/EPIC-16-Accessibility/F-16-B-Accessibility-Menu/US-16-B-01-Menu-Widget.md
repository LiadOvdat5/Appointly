# US-16-B-01: Accessibility Menu Button and Panel

**Feature:** [[F-16-B-Accessibility-Menu|F-16-B: Accessibility Menu Widget]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** 🔲 Not Started

---

## Story
As a **user with a disability**, I want **a clearly visible accessibility button always available in the app** so that **I can open a settings panel and adjust the app to my needs at any time**.

## Tasks
- `[FE]` Add an accessibility icon button (♿ / eye icon) to the app header — visible on all pages
- `[FE]` Clicking opens a panel/drawer listing all accessibility options
- `[FE]` Panel is keyboard accessible and screen-reader announced (`role="dialog"` or `role="region"`)
- `[FE]` Panel closes on `Escape` or clicking outside
- `[FE]` Button has `aria-label="Accessibility settings"` and `aria-expanded` state

## Acceptance Criteria
- [ ] Accessibility button is visible on every page in the header
- [ ] Panel opens and lists all available options
- [ ] Panel is fully operable by keyboard
- [ ] Screen readers announce the panel correctly
