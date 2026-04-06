# US-14-D-02: Suspend / Reactivate a User Account

**Feature:** [[F-14-D-User-Management|F-14-D: User Management]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **suspend a user account** so that **a bad actor is blocked from logging in and using the platform**.

## Tasks
- `[DB]` Add `IsSuspended` (bool, default false) and `SuspendedReason` (nullable string) to `Users` table; migration
- `[BE]` `POST /admin/users/{userId}/suspend` — sets `IsSuspended = true`, stores reason
- `[BE]` `POST /admin/users/{userId}/reactivate` — clears suspension
- `[BE]` Update login: return `403 Forbidden` with "Your account has been suspended" if `IsSuspended = true`
- `[FE]` Suspend / Reactivate button in the user list row (with a reason input modal for suspend)
- `[FE]` Suspended users cannot log in — the login page shows the suspension message

## Acceptance Criteria
- [x] A suspended user receives a clear error message when attempting to log in
- [x] Admin can reactivate a suspended account and the user can log in again
- [x] Suspension reason is recorded and visible to the admin in the user list
