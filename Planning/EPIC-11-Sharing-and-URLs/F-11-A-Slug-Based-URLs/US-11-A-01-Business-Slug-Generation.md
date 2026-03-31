# US-11-A-01: Auto-Generate Business URL Slug

**Feature:** [[F-11-A-Slug-Based-URLs|F-11-A: Slug-Based URLs]]
**Epic:** [[EPIC-11-Sharing-and-URLs|EPIC-11: Sharing & URL Improvements]]
**Status:** ✅ Done

---

## Story
As the **system**, I want to **automatically generate a unique, URL-safe slug for each business** so that **business pages have clean, readable URLs**.

## Tasks
- `[DB]` Add `Slug` column (varchar, unique, not null) to `Businesses` table
- `[DB]` Migration: add column and backfill existing businesses with slugs derived from their names
- `[BE]` In `BusinessService.CreateBusiness`, generate a slug from the business name: lowercase, spaces → hyphens, strip special characters (e.g., "John's Barbershop" → "johns-barbershop")
- `[BE]` Ensure slug uniqueness: if "johns-barbershop" exists, append "-2", "-3", etc.
- `[BE]` Add `GET /businesses/by-slug/{slug}` endpoint returning `BusinessDTO` — used by the frontend to resolve slug → business data
- `[BE]` Include `Slug` in `BusinessDTO` so the frontend can use it for link generation

## Acceptance Criteria
- [x] Every business has a unique, non-null slug after migration
- [x] New businesses automatically get a slug on creation
- [x] Slug contains only lowercase letters, digits, and hyphens — no spaces or special chars
- [x] Slug collision is resolved by appending a counter suffix
- [x] `GET /businesses/by-slug/{slug}` returns 404 for unknown slugs
