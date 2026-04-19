# US-07-C-03: Push Notification Delivery for Broadcasts

**Feature:** [[F-07-C-Broadcast-to-Followers|F-07-C: Broadcast to Followers]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** ✅ Done

---

## Story
As a **follower with push notifications enabled**, I want to **receive a device push notification when a business I follow sends a broadcast** so that **I see the message even when the app is not open**.

## Tasks
- `[BE]` Extend the fan-out background job (from US-07-C-01) to also call the push delivery service for each follower
- `[BE]` Reuse the existing `PushSubscription` lookup and Web Push library already used for appointment notifications
- `[BE]` Push payload: `{ title: "{BusinessName}", body: "{broadcast.Body}", data: { targetPath: "/business/{businessId}" } }`
- `[BE]` Failed push deliveries (subscription expired/revoked) should clean up the `PushSubscription` record (same pattern as existing push notifications)
- `[FE]` Service worker already handles push events — verify the `targetPath` from the data payload routes correctly to the business page when the notification is tapped

## Acceptance Criteria
- [x] Followers with active push subscriptions receive a device push within a few seconds of the broadcast being sent
- [x] Followers without push subscriptions receive only the in-app notification — no error
- [x] Tapping the push notification opens the business page
- [x] Expired push subscriptions are removed automatically on delivery failure
- [x] No duplicate pushes if the fan-out job is retried

## Dependencies
- US-07-C-01 (fan-out job) must be implemented first
- EPIC-09 F-09-D (push infrastructure) ✅
