# US-11-A-03: Redirect Legacy UUID-Based URLs

**Feature:** [[F-11-A-Slug-Based-URLs|F-11-A: Slug-Based URLs]]
**Epic:** [[EPIC-11-Sharing-and-URLs|EPIC-11: Sharing & URL Improvements]]
**Status:** ✅ Done

---

## Story
As the **system**, I want to **redirect old UUID-based business URLs to the new slug-based URLs** so that **existing links remain functional after the migration**.

## Tasks
- `[BE]` The existing `GET /businesses/{id}` endpoint (UUID lookup) remains functional — used internally for fallback
- `[FE]` In the route for `/business/:identifier`, detect whether the identifier looks like a UUID (contains dashes + length 36) or a slug
- `[FE]` If it looks like a UUID, call `GET /businesses/{id}`, get the slug from the response, and redirect to `/business/{slug}` with a 301-style client-side `navigate(..., { replace: true })`

## Acceptance Criteria
- [x] Visiting `/business/<uuid>` redirects to `/business/<slug>` without a visible broken page
- [x] The redirect replaces the history entry so the back button works correctly
- [x] Slug-based URLs continue to work normally (no interference from redirect logic)
