# US-14-B-01: Platform Stats Overview

**Feature:** [[F-14-B-Admin-Dashboard|F-14-B: Admin Dashboard]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **see key platform metrics on a single dashboard page** so that **I can quickly understand the health and activity of BizSlot**.

## Tasks
- `[BE]` `GET /admin/stats` — returns: total users, total businesses, total appointments, total reviews, count of flagged-and-pending reviews
- `[FE]` Admin home page at `/admin` shows metric cards: Users, Businesses, Appointments, Reviews, Pending Flags
- `[FE]` "Pending Flags" card is highlighted (e.g., orange) when count > 0 and links to the flagged reviews page

## Acceptance Criteria
- [x] All counts are accurate and reflect live DB data
- [x] Pending flagged reviews count is prominently surfaced with a link to the moderation queue
- [x] Page is accessible only to users with `admin` role
