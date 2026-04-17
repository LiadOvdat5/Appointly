# US-09-D-01: Subscribe Device to Push Notifications

**Feature:** [[F-09-D-Push-Notifications|F-09-D: Push Notifications (PWA)]]
**Status:** ✅ Done

---

## User Story

As a **customer or business owner** who has installed Appointly as a PWA,
I want to be asked to allow push notifications once,
so that I receive appointment alerts even when the app is closed.

---

## Tasks

### [BE] Generate & expose VAPID public key
- Install `WebPush` NuGet package (`WebPush-csharp`)
- Generate VAPID key pair once; store private key in app secrets / env vars
- Add `GET /push/vapid-public-key` endpoint returning `{ publicKey: string }`

### [DB] Add PushSubscriptions table
- `Id` (int PK)
- `UserId` (FK → Users)
- `Endpoint` (nvarchar, unique)
- `P256DH` (nvarchar)
- `Auth` (nvarchar)
- `CreatedAt` (datetime2)
- `UserAgent` (nvarchar, nullable) — for display / dedup
- Migration: `AddPushSubscriptions`

### [BE] Push subscription CRUD endpoints
- `POST /push-subscriptions` — save new subscription (idempotent by endpoint)
- `DELETE /push-subscriptions` — remove subscription by endpoint (on permission revoke or uninstall)
- Require authentication; associate subscription with `req.UserId`

### [FE] Fetch VAPID public key on app init
- Call `GET /push/vapid-public-key` once, cache in memory
- Expose via a `usePushVapidKey()` hook or store in Redux

### [FE] Permission prompt + subscription flow
- On first meaningful interaction (e.g. after first successful booking, or from notification settings), call `Notification.requestPermission()`
- If granted: `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` → POST to `/push-subscriptions`
- If denied: store dismissal in `localStorage`; never prompt again in the same session
- Handle `pushManager.getSubscription()` to avoid re-subscribing on subsequent loads

### [FE] Service Worker — push event handler
- In `sw.js` (or Vite PWA auto-generated SW), add:
  ```js
  self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        data: { url: data.url },
      })
    );
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
  });
  ```

### [FE] Notification settings UI (basic toggle)
- In user profile / notification settings page: toggle "Push notifications" on/off
- Off: call `DELETE /push-subscriptions` and `subscription.unsubscribe()`

---

## Acceptance Criteria

- [ ] PWA install → browser shows native "Allow notifications?" prompt at appropriate moment
- [ ] Granting permission → subscription saved in `PushSubscriptions` table for authenticated user
- [ ] Denying → no repeat prompts; preference stored locally
- [ ] Multiple devices: each has its own subscription row; all receive pushes
- [ ] Unsubscribing removes the row from the DB and calls `subscription.unsubscribe()`
- [ ] `GET /push/vapid-public-key` returns the correct public key
