# US-05-E-02: Ratings in Search

**Feature:** [[F-05-E-Future-Enhancements|F-05-E: Future Enhancements]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **see business ratings displayed in search results** so that **I can make informed decisions about which business to choose**.

## Tasks
- `[FE]` Add rating stars component to `BusinessCard`
- `[BE]` Include average rating in the search result `BusinessDTO` (depends on Reviews feature — future epic)
- `[FE]` Businesses with no ratings are shown without stars (not a zero-star display)

## Acceptance Criteria
- [x] Average rating is displayed as a star rating on each business card
- [x] Businesses with no reviews are shown without a star rating (not as 0 stars)
- [x] Depends on a future Reviews epic being implemented first
