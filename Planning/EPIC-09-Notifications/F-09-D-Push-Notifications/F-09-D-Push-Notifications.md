# F-09-D: Push Notifications (PWA)

**Epic:** [[EPIC-09-Notifications|EPIC-09: Notifications]]
**Status:** 🔲 Not Started

---

## Overview

Enable native push notifications for users who have installed Appointly as a PWA on their phone. When the app is in the background or closed, users still receive timely alerts for appointment bookings, cancellations, reminders, and review prompts — delivered via the Web Push API (VAPID).

This feature extends the existing in-app notification system (F-09-A, F-09-B, F-09-C) with a push delivery channel. It does not replace in-app notifications; push is an additional delivery layer that works when the app is not open.

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-09-D-01-Push-Subscription\|US-09-D-01]] | Subscribe device to push notifications | 🔲 Not Started |
| [[US-09-D-02-Push-Triggers\|US-09-D-02]] | Send push on appointment events | 🔲 Not Started |
| [[US-09-D-03-Push-Preferences\|US-09-D-03]] | Manage push notification preferences | 🔲 Not Started |

---

## Technical Approach

### Web Push Stack
- **VAPID keys** — Generate once on server, public key sent to frontend
- **Service Worker** — `push` event listener in `sw.js` calls `self.registration.showNotification(...)`
- **Backend** — `WebPush` NuGet package (WebPush-csharp) sends encrypted payloads to browser push service endpoints

### Flow
1. User installs PWA (or grants notification permission in browser)
2. Frontend: `Notification.requestPermission()` → subscribe via `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`
3. Frontend: POST subscription object (`endpoint`, `p256dh`, `auth`) to `/push-subscriptions`
4. Backend: Stores subscription per user in `PushSubscriptions` table
5. On appointment event: backend fan-outs push payload to all user's active subscriptions
6. Browser push service delivers to device; service worker shows native notification
7. Clicking notification: `notificationclick` event in SW navigates to relevant URL

### Notification Click Deep Links
| Event | Target URL |
|-------|-----------|
| Booking confirmed (customer) | `/booking-confirmation/:appointmentId` |
| Booking confirmed (owner) | `/dashboard/:businessSlug` |
| Appointment cancelled | `/search` |
| Reminder | `/booking-confirmation/:appointmentId` |
| Review prompt | `/review/:businessId` |
