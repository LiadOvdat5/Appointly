# US-11-A-02: Route Business Pages by Slug

**Feature:** [[F-11-A-Slug-Based-URLs|F-11-A: Slug-Based URLs]]
**Epic:** [[EPIC-11-Sharing-and-URLs|EPIC-11: Sharing & URL Improvements]]
**Status:** ✅ Done

---

## Story
As a **customer or visitor**, I want to **access a business page via a readable URL like `/business/johns-barbershop`** so that **the URL is clean and shareable**.

## Tasks
- `[FE]` Change route from `/business/:businessId` to `/business/:slug`
- `[FE]` In `PublicBusinessPage`, use the slug param to call `GET /businesses/by-slug/{slug}` to load the business
- `[FE]` Update all internal links that currently use the UUID to use the slug instead (dashboard links, booking links, search result links, etc.)
- `[FE]` Change booking route from `/book/:businessId/:serviceId` to `/book/:businessSlug/:serviceId`
- `[FE]` Update dashboard routes: `/dashboard/:businessId` → `/dashboard/:businessSlug`
- `[FE]` Update schedule routes: `/business/:businessId/schedule` → `/business/:businessSlug/schedule`

## Acceptance Criteria
- [x] `/business/johns-barbershop` loads the correct business page
- [x] All internal navigation uses slugs — no UUID visible in any app URL
- [x] The booking flow works end-to-end with slug-based URLs
- [x] 404 page is shown for unknown slugs
