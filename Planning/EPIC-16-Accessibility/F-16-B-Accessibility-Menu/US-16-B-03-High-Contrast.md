# US-16-B-03: High Contrast Mode

**Feature:** [[F-16-B-Accessibility-Menu|F-16-B: Accessibility Menu Widget]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** 🔲 Not Started

---

## Story
As a **user with low vision or photosensitivity**, I want to **enable a high-contrast color theme** so that **text and UI elements are easier to distinguish**.

## Tasks
- `[FE]` Accessibility menu includes a "High Contrast" toggle
- `[FE]` Toggling applies a `.high-contrast` class to `<html>` or `<body>`
- `[FE]` Define a high-contrast CSS theme that overrides background, text, border, and button colors using Tailwind CSS custom properties or a dedicated CSS layer
- `[FE]` Ensure business theme colors are also overridden in high-contrast mode
- `[FE]` Respect the OS-level `prefers-contrast: more` media query as a default

## Acceptance Criteria
- [ ] High contrast mode is togglable from the accessibility menu
- [ ] All text, backgrounds, and interactive elements switch to high-contrast palette
- [ ] App is still visually coherent and usable in high-contrast mode
- [ ] OS high-contrast preference is automatically respected on first load
