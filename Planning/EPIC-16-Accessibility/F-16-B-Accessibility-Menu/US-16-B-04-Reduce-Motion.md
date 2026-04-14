# US-16-B-04: Reduce Motion Mode

**Feature:** [[F-16-B-Accessibility-Menu|F-16-B: Accessibility Menu Widget]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** 🔲 Not Started

---

## Story
As a **user with vestibular disorder or motion sensitivity**, I want to **disable or reduce animations and transitions in the app** so that **the app does not trigger dizziness or discomfort**.

## Tasks
- `[FE]` Accessibility menu includes a "Reduce Motion" toggle
- `[FE]` Toggling applies a `.reduce-motion` class to `<html>` which disables/minimizes CSS transitions and animations
- `[FE]` Respect the OS-level `prefers-reduced-motion: reduce` media query as a default on first load
- `[FE]` Audit all CSS transitions and animations — ensure they are wrapped in motion-safe media queries or controlled by the class

## Acceptance Criteria
- [ ] Reduce motion toggle is available in the accessibility menu
- [ ] Enabling it removes all non-essential animations app-wide
- [ ] OS `prefers-reduced-motion` preference is honored automatically
