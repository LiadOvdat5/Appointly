# US-19-A-01: Footer Layout & Copyright

**Feature:** [[F-19-A-Global-Footer|F-19-A: Global Footer]]
**Epic:** [[EPIC-19-App-Shell-and-Global-Layout|EPIC-19: App Shell & Global Layout]]
**Status:** ✅ Done

---

## Story
As a **visitor or user**, I want to **see a consistent footer at the bottom of every page** so that **the app feels complete and professionally branded**.

## Tasks
- `[FE]` Create a `Footer` component in `components/layout/Footer.tsx`
- `[FE]` Render the Appointly logo/wordmark (small) on the left side
- `[FE]` Display dynamic copyright line: `© {currentYear} Appointly. All rights reserved.`
- `[FE]` Mount `<Footer />` inside `AppShell` so it appears on every route
- `[FE]` Footer should be full-width, pinned to the bottom of the content flow (not sticky/fixed — scrolls with the page)
- `[FE]` Responsive layout: stacks vertically on mobile, horizontal columns on desktop
- `[FE]` Add i18n keys for all footer strings

## Acceptance Criteria
- [ ] Footer is visible on every route (home, search, business page, dashboard, etc.)
- [ ] Copyright year updates automatically without a code change
- [ ] Layout does not overflow or break on 320 px wide screens
- [ ] Footer background and text meet WCAG AA contrast requirements
