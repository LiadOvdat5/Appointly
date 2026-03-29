# US-09-A-02: Notification Bell and List in Header

**Feature:** [[F-09-A-In-App-Notifications|F-09-A: In-App Notification Center]]
**Epic:** [[EPIC-09-Notifications|EPIC-09: Notifications]]
**Status:** 🔲 Not Started

---

## Story
As a **logged-in user**, I want to **see a notification bell icon in the header with a badge count** so that **I know when I have unread notifications without navigating away**.

## Tasks
- `[FE]` Add notification bell icon to the `Header` / `TopNavBar` component (visible when authenticated)
- `[FE]` Badge on the bell shows unread count; hidden when count is zero
- `[FE]` Clicking the bell opens a dropdown/panel listing recent notifications (newest first)
- `[FE]` Each notification shows: icon by type, title, body snippet, time ago, and read/unread visual state
- `[FE]` Clicking a notification marks it as read and navigates to the relevant page (e.g., clicking an appointment notification goes to the appointment)
- `[FE]` "Mark all as read" button at the top of the panel
- `[FE]` Poll unread count every 60 seconds while the app is open (no WebSocket required at this stage)

## Acceptance Criteria
- [ ] Bell badge count updates within 60 seconds of a new notification being created
- [ ] Unread notifications are visually distinct from read ones
- [ ] Clicking a notification correctly navigates to the relevant entity
- [ ] "Mark all as read" clears the badge and marks all items as read
- [ ] Panel is accessible on both mobile and desktop layouts
