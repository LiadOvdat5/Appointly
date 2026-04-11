# US-13-C-01: Mobile Layout and Touch Usability Audit

**Feature:** [[F-13-C-Mobile-UX-Audit|F-13-C: Mobile UX Audit]]
**Epic:** [[EPIC-13-PWA|EPIC-13: Progressive Web App (PWA)]]
**Status:** 🔄 In Progress

---

## Story
As a **mobile user**, I want to **use BizSlot comfortably on my phone** so that **booking and browsing work as well as on desktop**.

## Tasks
- `[FE]` Test each page at 375px width (iPhone SE) and 390px (iPhone 14): `SelectionPage`, `SearchPage`, `PublicBusinessPage`, `BookingPage`, `CustomerDashboard`, `DashboardPage`
- `[FE]` Fix any horizontally overflowing elements (use `overflow-x: hidden` or responsive classes)
- `[FE]` Ensure all tap targets are at least 44×44px (buttons, links, form elements)
- `[FE]` Fix any text that is too small to read on mobile (minimum 14px)
- `[FE]` Ensure the booking flow (date picker → time slot → confirm) is fully usable with touch on mobile
- `[FE]` Verify the schedule editor and map view are usable on mobile
- `[FE]` Add a mobile-friendly bottom navigation bar or hamburger menu if the sidebar is not usable on small screens

## Additional UX fixes (completed)
- `[FE]` Remove duplicate back arrow — global `Header` back button removed; each page owns its own back navigation
- `[FE]` Fix `ScheduleEditorPage` back button — was hard-coded to `/business/:id`, now uses `navigate(-1)`
- `[FE]` Remove dead "Settings" sidebar link — route `/settings` never existed; link removed from `RoleSidebar`
- `[FE]` Service card clarity — replaced implicit full-card click with two explicit icon buttons: `edit_calendar` (availability/hours) and `edit` (service details)

## Acceptance Criteria
- [x] All pages render without horizontal scroll on a 375px viewport
- [x] All interactive elements are comfortably tappable
- [x] The full booking flow can be completed on a mobile device
- [x] No text is clipped or unreadably small on mobile
- [x] Only one back arrow visible per page — in the page's own header, not duplicated in the global app header
- [x] Back navigation always returns to the previous page, not a hardcoded route
- [ ] Lighthouse PWA audit score is ≥ 90
