# US-08-B-02: Aggregate Rating Display

**Feature:** [[F-08-B-Reviews-On-Business-Page|F-08-B: Reviews on Business Page]]
**Epic:** [[EPIC-08-Reviews-and-Ratings|EPIC-08: Reviews & Ratings]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **see a business's overall star rating and review count at a glance** so that **I can quickly assess its reputation on the search page and business page**.

## Tasks
- `[BE]` `BusinessDTO` already has `AverageRating` and `ReviewCount` fields — ensure they are populated from the `Business` table (updated on each review submit/delete)
- `[FE]` Display star rating + review count on the `PublicBusinessPage` header (e.g., "4.7 ★ (38 reviews)")
- `[FE]` Display star rating on `BusinessCard` in search results (already stubbed — wire up real data)
- `[FE]` Businesses with zero reviews show no stars (not zero stars) — match existing search stub behavior

## Acceptance Criteria
- [x] `AverageRating` is accurate to one decimal place
- [x] `ReviewCount` reflects the real number of reviews
- [x] Businesses with no reviews show no rating indicator (not "0.0 ★")
- [x] Star display on search results and business page are visually consistent
