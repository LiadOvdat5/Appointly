# US-10-C-01: RTL Layout Audit and Fix

**Feature:** [[F-10-C-RTL-Layout|F-10-C: RTL Layout Correctness]]
**Epic:** [[EPIC-10-Internationalization|EPIC-10: Internationalization (i18n) Hardening]]
**Status:** ✅ Done

---

## Story
As a **Hebrew-speaking user**, I want to **see all app layouts correctly mirrored for right-to-left reading** so that **the interface feels natural and professional in Hebrew**.

## Tasks
- `[FE]` Set `dir="rtl"` on `<html>` element when language is Hebrew; `dir="ltr"` otherwise
- `[FE]` Audit the `AppShell`, `RoleSidebar`, `Header`, and `TopNavBar` — ensure sidebars flip to the right and nav elements mirror correctly
- `[FE]` Audit all form components (`Input`, `Select`, `Textarea`) — text alignment, icon placement (e.g., search icon, clear button)
- `[FE]` Audit `Card`, `Modal`, `Alert`, and `Badge` components for directional padding/margins that break in RTL
- `[FE]` Audit `BusinessCard` in search results and the public business page
- `[FE]` Use Tailwind's `rtl:` modifier where needed rather than custom CSS overrides
- `[FE]` Test booking flow and schedule editor in RTL mode

## Acceptance Criteria
- [x] `dir="rtl"` is applied to the document when the language is Hebrew
- [x] Sidebar appears on the right side in RTL mode
- [x] All form fields show text right-aligned in Hebrew
- [x] No elements visually overlap or overflow due to direction change
- [x] The booking flow is fully usable in RTL mode
