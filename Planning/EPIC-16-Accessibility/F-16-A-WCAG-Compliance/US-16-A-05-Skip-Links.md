# US-16-A-05: Skip-to-Content Links

**Feature:** [[F-16-A-WCAG-Compliance|F-16-A: WCAG 2.1 AA Compliance]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** ✅ Done

---

## Story
As a **keyboard or screen reader user**, I want **skip links at the top of each page** so that **I can bypass repetitive navigation and jump directly to the main content**.

## Tasks
- `[FE]` Add a visually-hidden "Skip to main content" link as the first focusable element in `AppShell`
- `[FE]` The link becomes visible on focus (standard pattern)
- `[FE]` Main content area has `id="main-content"` as the skip target
- `[FE]` Consider a "Skip to navigation" link for pages with long content

## Acceptance Criteria
- [x] Pressing `Tab` from a fresh page load focuses the skip link first
- [x] Activating the skip link moves focus to the main content landmark
- [x] Skip link is invisible until focused
