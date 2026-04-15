# US-16-A-04: Sufficient Color Contrast

**Feature:** [[F-16-A-WCAG-Compliance|F-16-A: WCAG 2.1 AA Compliance]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** ✅ Done

---

## Story
As a **user with low vision or color blindness**, I want **all text and UI controls to have sufficient contrast against their background** so that **I can read and use the app comfortably**.

## Tasks
- `[FE]` Audit all text elements against WCAG AA minimums: 4.5:1 for normal text, 3:1 for large text
- `[FE]` Audit all UI components (buttons, badges, tags, inputs) for contrast
- `[FE]` Business theme colors (owner-chosen) must be validated — clamp or warn if chosen color produces inaccessible text contrast
- `[FE]` Status badges (appointment status, invitation status) must not rely on color alone — add text or icon

## Acceptance Criteria
- [x] All default text passes 4.5:1 contrast ratio
- [x] Large text (≥18pt or 14pt bold) passes 3:1
- [x] Theme color selection in owner edit mode warns if the chosen color is inaccessible
- [x] Status information is conveyed by text or pattern, not color alone
