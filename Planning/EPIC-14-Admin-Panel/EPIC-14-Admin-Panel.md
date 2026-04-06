# EPIC-14: Admin Panel

**Status:** 🔄 In Progress

---

## Goal
Give a trusted `admin` user full visibility and control over the platform: moderate flagged reviews, manage users and businesses, and monitor overall health.

---

## Features

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| [[F-14-A-Admin-Auth\|F-14-A]] | Admin Role & Authentication | P0 — blocker for all others | ✅ Done |
| [[F-14-B-Admin-Dashboard\|F-14-B]] | Admin Dashboard (platform overview) | P1 | 🔲 Not Started |
| [[F-14-C-Flagged-Review-Moderation\|F-14-C]] | Flagged Review Moderation | P0 — core use case | 🔲 Not Started |
| [[F-14-D-User-Management\|F-14-D]] | User Management (view / suspend) | P2 | 🔲 Not Started |
| [[F-14-E-Business-Moderation\|F-14-E]] | Business Moderation (view / suspend) | P2 | 🔲 Not Started |

---

## Key Design Decisions

- Admin is a **role** (`admin`) added to the existing `UserRole` enum — no separate user table needed.
- Admin accounts are **seeded manually** in the DB (no self-registration as admin).
- All admin API endpoints are protected with `[Authorize(Roles = "admin")]`.
- Admin UI lives at `/admin/*` — a separate layout from the main customer/owner app.
- Flagged reviews are **not auto-removed** — an admin must explicitly choose to remove or dismiss the flag.

---

## Dependencies

- EPIC-01 (auth) — JWT and role claims already in place; just needs `admin` added to the enum and seeded.
- EPIC-08 F-08-C — `IsFlagged` / `FlagReason` fields on `Reviews` (already implemented).
