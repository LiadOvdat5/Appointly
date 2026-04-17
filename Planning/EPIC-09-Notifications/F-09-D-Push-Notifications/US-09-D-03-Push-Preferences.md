# US-09-D-03: Manage Push Notification Preferences

**Feature:** [[F-09-D-Push-Notifications|F-09-D: Push Notifications (PWA)]]
**Status:** ✅ Done

---

## User Story

As a **customer or business owner**,
I want to control which push notifications I receive,
so that I'm not overwhelmed by notifications I don't care about.

---

## Tasks

### [DB] Add PushPreferences table (or extend Users)
- Option A (recommended): Add columns to `Users`:
  - `PushBookingConfirm` (bit, default 1)
  - `PushCancellations` (bit, default 1)
  - `PushReminders24h` (bit, default 1)
  - `PushReminders1h` (bit, default 1)
  - `PushReviewPrompt` (bit, default 1)
- Migration: `AddPushPreferencesToUsers`

### [BE] Push preferences endpoint
- `GET /users/push-preferences` — return current preference flags for authenticated user
- `PUT /users/push-preferences` — update flags (partial update OK)
- `PushNotificationService.SendAsync` reads the recipient's preferences before sending; skips if the relevant flag is off

### [FE] Push preferences UI
- Add a "Push Notifications" section to the existing notification settings page (or user profile)
- Toggle list per event type (booking confirmed, cancellations, reminders, review prompt)
- Persist via `PUT /users/push-preferences`
- Master toggle: "Enable push notifications" — if off, unsubscribes device; if re-enabled, re-subscribes

---

## Acceptance Criteria

- [ ] User can disable specific push categories without revoking OS permission
- [ ] Disabled category: backend skips sending push for that event type
- [ ] Re-enabling a category: next qualifying event sends a push
- [ ] Master toggle off: device unsubscribed; no pushes delivered
- [ ] Master toggle back on: device re-subscribed; preferences restored
- [ ] Default: all categories enabled for new users
