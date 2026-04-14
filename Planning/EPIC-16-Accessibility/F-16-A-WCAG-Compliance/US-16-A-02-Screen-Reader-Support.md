# US-16-A-02: Screen Reader Support (ARIA)

**Feature:** [[F-16-A-WCAG-Compliance|F-16-A: WCAG 2.1 AA Compliance]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** 🔲 Not Started

---

## Story
As a **blind or visually impaired user**, I want **all app content and interactions to be announced correctly by a screen reader** so that **I can use the app independently**.

## Tasks
- `[FE]` Add meaningful `alt` text to all images (logos, banners, category icons)
- `[FE]` All icon-only buttons must have `aria-label` or visually-hidden text
- `[FE]` Form inputs must have associated `<label>` elements or `aria-label`
- `[FE]` Dynamic content changes (search results updating, booking confirmation) must use `aria-live` regions
- `[FE]` Custom components (RoleSidebar, BusinessCard, ServiceCard, slots) must expose correct ARIA roles
- `[FE]` Modal dialogs use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
- `[FE]` Loading spinners announce loading state with `aria-busy`
- `[FE]` Error messages are associated with their input via `aria-describedby`

## Acceptance Criteria
- [ ] All images have descriptive `alt` text; decorative images use `alt=""`
- [ ] Icon-only buttons are announced with a meaningful label
- [ ] Form errors are read by the screen reader immediately after they appear
- [ ] Search result updates are announced via `aria-live="polite"`
- [ ] Modal announced as dialog with accessible name; focus moves to modal on open
- [ ] App tested and verified with NVDA (Windows) and VoiceOver (Mac/iOS)
