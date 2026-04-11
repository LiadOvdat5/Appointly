# US-13-D-02: Consistent Dark Surface Colors

**Feature:** [[F-13-D-Dark-Mode|F-13-D: Dark Mode]]
**Epic:** [[EPIC-13-PWA|EPIC-13: Progressive Web App (PWA)]]
**Status:** ✅ Done

---

## Story
As a **user**, I want **all cards and panels to look dark when dark mode is active** so that **nothing blinds me with a white card on a dark background**.

## Tasks
- `[FE]` Diagnose why `dark:bg-surface-dark` had no effect — root cause: Tailwind v4 only reads `@theme` in CSS, not `tailwind.config.js`
- `[FE]` Add `--color-surface-dark: #1c2a37` to `@theme` block in `index.css` — used for card/panel backgrounds (slightly lighter than `#111921` page bg)
- `[FE]` Verify all dashboard cards (business + customer), inner sticky page headers, and service cards now render with the correct dark surface

## Acceptance Criteria
- [x] All cards across business dashboard, customer dashboard, and public business page use `#1c2a37` background in dark mode
- [x] Inner sticky page headers (e.g. "My Dashboard", services page header) are dark in dark mode
- [x] No white "islands" visible on any dark-mode page
- [x] Surface color provides clear visual separation from the `#111921` page background
