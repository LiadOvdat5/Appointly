# US-14-D-01: View All Users

**Feature:** [[F-14-D-User-Management|F-14-D: User Management]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **browse and search all registered users** so that **I can identify accounts that may need action**.

## Tasks
- `[BE]` `GET /admin/users?search=&role=&page=&pageSize=` — paginated, filterable by name/email and role
- `[BE]` Response: id, name, email, role, createdAt, isSuspended
- `[FE]` Admin page at `/admin/users` with a searchable, paginated table
- `[FE]` Show role badge (Customer / Owner / Admin) and suspension status per row

## Acceptance Criteria
- [x] All users are listed with name, email, role, and join date
- [x] Search by name or email works
- [x] Filter by role works
- [x] Suspended users are visually distinguished
