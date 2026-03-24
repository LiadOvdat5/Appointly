# US-01-C-02: Route Guard

**Feature:** [[F-01-C-Protected-Routes|F-01-C: Protected Routes]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As an **unauthenticated user**, I want to **be redirected to the login page when I try to access a protected page** so that **private content is kept secure**.

## Tasks
- `[FE]` Implement `ProtectedRoute` component that checks auth state before rendering children
- `[FE]` Wrap all protected routes (e.g., `/dashboard`, `/booking`) with `ProtectedRoute`
- `[FE]` Preserve the originally requested URL so the user is redirected back after login

## Acceptance Criteria
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Authenticated users can access protected routes without interruption
- [ ] After logging in, the user is redirected to the originally requested page (or role default)
