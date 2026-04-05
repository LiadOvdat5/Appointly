# US-13-B-02: Offline Fallback Page

**Feature:** [[F-13-B-Service-Worker-Offline|F-13-B: Service Worker & Offline Shell]]
**Epic:** [[EPIC-13-PWA|EPIC-13: Progressive Web App (PWA)]]
**Status:** ✅ Done

---

## Story
As a **user with no internet connection**, I want to **see a friendly offline message rather than a browser error** so that **the app feels polished even when offline**.

## Tasks
- `[FE]` Create an `offline.html` page with the BizSlot branding and a message: "You're offline — please check your internet connection"
- `[FE]` Configure the service worker to serve `offline.html` as a fallback for any navigation request that fails due to network unavailability
- `[FE]` Optionally: show an in-app banner when the app detects it has gone offline (using `navigator.onLine` + `online`/`offline` events)

## Acceptance Criteria
- [x] Going offline and navigating to a new route shows the offline page instead of a browser error
- [x] Previously cached pages still load normally when offline
- [x] The offline page is branded and clear about the network issue
