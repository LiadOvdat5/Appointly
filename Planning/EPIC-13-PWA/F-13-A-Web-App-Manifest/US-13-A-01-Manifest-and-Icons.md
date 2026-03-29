# US-13-A-01: Web App Manifest and Icons

**Feature:** [[F-13-A-Web-App-Manifest|F-13-A: Web App Manifest]]
**Epic:** [[EPIC-13-PWA|EPIC-13: Progressive Web App (PWA)]]
**Status:** 🔲 Not Started

---

## Story
As a **mobile user**, I want to **add BizSlot to my home screen** so that **I can open it like a native app without going through the browser**.

## Tasks
- `[FE]` Create `public/manifest.json` with: `name`, `short_name`, `description`, `start_url` (`/`), `display: standalone`, `background_color`, `theme_color`, icons array (192×192 and 512×512 PNG)
- `[FE]` Create app icons in required sizes and place in `public/icons/`
- `[FE]` Link the manifest in `index.html`: `<link rel="manifest" href="/manifest.json">`
- `[FE]` Add `<meta name="theme-color">` and `<meta name="apple-mobile-web-app-capable" content="yes">` tags for iOS support
- `[FE]` Add apple touch icon `<link>` for iOS home screen icon

## Acceptance Criteria
- [ ] Chrome on Android shows "Add to Home Screen" prompt when visiting the app
- [ ] App opens in standalone mode (no browser chrome) when launched from home screen
- [ ] App icon appears correctly on the home screen on both Android and iOS
- [ ] `start_url` launches the app at the correct route
