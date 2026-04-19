# F-07-C: Broadcast to Followers

**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** ✅ Done

---

## Goal
Allow a business owner to send a message to all their followers — delivered as an in-app notification and a push notification to devices where the follower has push enabled.

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-07-C-01-Broadcast-Backend\|US-07-C-01]] | Broadcast API — fan-out notifications to all followers | ✅ Done |
| [[US-07-C-02-Broadcast-UI\|US-07-C-02]] | "Message Followers" action in business dashboard | ✅ Done |
| [[US-07-C-03-Broadcast-Push-Delivery\|US-07-C-03]] | Push notification delivery for broadcasts | ✅ Done |
| [[US-07-C-04-Broadcast-History\|US-07-C-04]] | Broadcast history tab in dashboard | ✅ Done |

## Dependencies
- EPIC-07 F-07-A (follow system) ✅
- EPIC-09 F-09-A (notification model + service) ✅
- EPIC-09 F-09-D (push notifications) ✅

## Notes
- Fan-out (creating one notification per follower) should happen in a background job for businesses with many followers — do not block the HTTP request.
- Rate-limit to ~3 broadcasts per business per day to prevent spam and follower churn.
- A new `BusinessBroadcast` value must be added to the `NotificationType` enum; the FE notification bell must handle it gracefully.
