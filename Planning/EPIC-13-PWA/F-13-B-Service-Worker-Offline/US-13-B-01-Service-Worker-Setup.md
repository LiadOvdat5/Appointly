# US-13-B-01: Service Worker Setup and App Shell Caching

**Feature:** [[F-13-B-Service-Worker-Offline|F-13-B: Service Worker & Offline Shell]]
**Epic:** [[EPIC-13-PWA|EPIC-13: Progressive Web App (PWA)]]
**Status:** 🔲 Not Started

---

## Story
As the **system**, I want to **register a service worker that caches the app shell** so that **the app loads quickly on repeat visits and works offline**.

## Tasks
- `[FE]` Install `vite-plugin-pwa` (Workbox-based) as a dev dependency
- `[FE]` Configure `vite-plugin-pwa` in `vite.config.ts`: set `registerType: 'autoUpdate'`, define `workbox.globPatterns` to cache JS/CSS/HTML/images
- `[FE]` Set `includeAssets` to include fonts and icons
- `[FE]` The plugin auto-generates `sw.js` and injects the manifest link — remove any manual manifest link added in F-13-A to avoid duplication (or configure the plugin to reference the existing manifest)

## Acceptance Criteria
- [ ] Service worker is registered and visible in browser DevTools > Application > Service Workers
- [ ] App shell (HTML, JS bundles, CSS) is cached after first visit
- [ ] Subsequent visits load from cache (fast) even when the network is slow
- [ ] Service worker updates automatically when a new version is deployed
