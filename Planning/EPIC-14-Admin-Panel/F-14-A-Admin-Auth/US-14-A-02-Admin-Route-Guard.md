# US-14-A-02: Admin Route Guard

**Feature:** [[F-14-A-Admin-Auth|F-14-A: Admin Role & Authentication]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want **all `/admin` pages to be inaccessible to non-admin users** so that **sensitive moderation tools cannot be reached by customers or business owners**.

## Tasks
- `[FE]` Create an `AdminRoute` guard component (similar to `ProtectedRoute`) that checks `user.role === "admin"`
- `[FE]` Wrap all `/admin/*` routes in `AdminRoute`
- `[FE]` Create a minimal `/admin` layout (sidebar with links: Dashboard, Flagged Reviews, Users, Businesses)
- `[FE]` Show a 403 / "Access Denied" page for logged-in non-admin users who navigate to `/admin`

## Acceptance Criteria
- [x] A logged-out user visiting `/admin` is redirected to `/login`
- [x] A logged-in customer or owner visiting `/admin` sees an "Access Denied" page
- [x] Admin layout renders a sidebar with navigation to all admin sections
