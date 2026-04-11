# US-13-D-01: Dark Mode Toggle

**Feature:** [[F-13-D-Dark-Mode|F-13-D: Dark Mode]]
**Epic:** [[EPIC-13-PWA|EPIC-13: Progressive Web App (PWA)]]
**Status:** ✅ Done

---

## Story
As a **user**, I want to **switch between light and dark mode** so that **I can use the app comfortably in any lighting condition**.

## Tasks
- `[FE]` Create `useDarkMode` hook — manages `dark` class on `<html>`, persists to `localStorage`, respects OS `prefers-color-scheme` as default
- `[FE]` Create `DarkModeToggle` component — sun/moon icon button, consistent with header button style
- `[FE]` Add `DarkModeToggle` to `Header` next to `LanguageToggle`
- `[FE]` Call `initDarkMode()` in `main.tsx` before React render to prevent flash-of-white on dark-mode users
- `[FE]` Add i18n keys (`theme.switchToDark`, `theme.switchToLight`) in EN + HE
- `[FE]` Fix Tailwind v4 dark mode — add `@custom-variant dark (&:where(.dark, .dark *))` to `index.css` (v4 ignores `tailwind.config.js`)

## Acceptance Criteria
- [x] Toggle button is visible in the header for all users (authenticated or not)
- [x] Clicking it switches the theme immediately with no page reload
- [x] Preference is persisted in `localStorage` and restored on next visit
- [x] First visit defaults to OS system preference
- [x] Icon shows moon in light mode, sun in dark mode
- [x] Tooltip is translated in EN and HE
