# US-14-A-01: Add Admin Role and Seed Account

**Feature:** [[F-14-A-Admin-Auth|F-14-A: Admin Role & Authentication]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As a **platform operator**, I want to **designate a user as an admin** so that **they can access the admin panel and moderate content**.

## Tasks
- `[DB]` Add `admin` value to the `UserRole` enum in the `User` model
- `[DB]` Migration: update the enum column to include `admin`
- `[BE]` Add a database seeder (or EF Core data seed) that creates one admin user (`admin@bizslot.com`, strong hashed password, role = `admin`) if none exists — seeded at startup
- `[BE]` Update JWT token generation to include the `admin` role claim
- `[BE]` Add `[Authorize(Roles = "admin")]` policy — used on all admin controllers
- `[FE]` Update the `authSlice` / user type to recognise `admin` role
- `[FE]` After login, redirect admin users to `/admin` instead of `/`

## Acceptance Criteria
- [x] An `admin` user can log in via the existing `/auth/login` endpoint
- [x] The JWT issued to an admin contains `role: admin`
- [x] A non-admin hitting `/admin/*` is redirected to `/` (or a 403 page)
- [x] The seed runs once — does not create duplicate admin accounts on restart
