# US-16-A-01: Full Keyboard Navigation

**Feature:** [[F-16-A-WCAG-Compliance|F-16-A: WCAG 2.1 AA Compliance]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** 🔲 Not Started

---

## Story
As a **user with a motor disability**, I want to **navigate the entire app using only a keyboard** so that **I am not dependent on a mouse or touch screen**.

## Tasks
- `[FE]` Audit all interactive elements (buttons, links, inputs, dropdowns, modals) for keyboard reachability
- `[FE]` Ensure logical tab order across all pages — follows visual reading order
- `[FE]` All custom components (RoleSidebar, modals, date picker, map controls) must be operable via keyboard
- `[FE]` Dropdown menus and popovers open/close with `Enter`/`Space`/`Escape`
- `[FE]` Map view (SearchMapView) must have keyboard-accessible alternatives for marker interaction
- `[FE]` Trap focus inside open modals; restore focus to trigger element on close

## Acceptance Criteria
- [ ] Every interactive element is reachable via `Tab` / `Shift+Tab`
- [ ] No keyboard traps exist outside intentional modal focus traps
- [ ] All modals close on `Escape` and return focus to the opening trigger
- [ ] Map markers have a keyboard-accessible list alternative
- [ ] Tab order matches the visual layout on all route-level pages
