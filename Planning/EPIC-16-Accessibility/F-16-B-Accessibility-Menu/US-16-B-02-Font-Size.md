# US-16-B-02: Adjustable Font Size

**Feature:** [[F-16-B-Accessibility-Menu|F-16-B: Accessibility Menu Widget]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** ✅ Done

---

## Story
As a **user with low vision**, I want to **increase or decrease the app's font size** so that **text is comfortable to read without relying on browser zoom**.

## Tasks
- `[FE]` Accessibility menu shows a font size control (e.g., Small / Default / Large / Extra Large)
- `[FE]` Applies a CSS class or `font-size` override on `<html>` element (using `rem`-based sizing)
- `[FE]` All text in the app uses `rem` units so it scales correctly
- `[FE]` Audit components to replace any `px`-based font sizes with `rem`

## Acceptance Criteria
- [x] User can select from at least 3 font size levels
- [x] All text on all pages scales accordingly
- [x] Layout does not break at the largest font size (no overflow, no truncation of critical text)
