# US-16-A-03: Focus Management for Modals and Routing

**Feature:** [[F-16-A-WCAG-Compliance|F-16-A: WCAG 2.1 AA Compliance]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** ✅ Done

---

## Story
As a **keyboard user**, I want **focus to move predictably when modals open/close and when I navigate between pages** so that **I never lose my place in the app**.

## Tasks
- `[FE]` On modal open: move focus to the first focusable element inside the modal
- `[FE]` On modal close: return focus to the element that triggered the modal
- `[FE]` On route change (React Router navigation): move focus to the page `<h1>` or a skip-target landmark
- `[FE]` Visible focus ring on all interactive elements — never suppress `outline` without an equivalent
- `[FE]` Create a reusable `useFocusTrap` hook for modals

## Acceptance Criteria
- [x] Opening any modal moves focus inside it
- [x] Closing a modal returns focus to the trigger
- [x] Navigating to a new page moves focus to the page heading
- [x] Focus indicator is always visible and meets 3:1 contrast ratio
