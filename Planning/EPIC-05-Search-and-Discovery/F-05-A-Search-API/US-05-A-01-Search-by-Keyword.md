# US-05-A-01: Search by Keyword

**Feature:** [[F-05-A-Search-API|F-05-A: Search API]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **search for businesses by name or keyword** so that **I can quickly find the service I need**.

## Tasks
- `[BE]` Implement `GET /search?query=&category=&lat=&lng=&radius=` via `SearchController`
- `[DB]` Apply text filter on Business `Name` and `Description` fields
- `[BE]` Return results ranked by relevance; empty query returns all businesses

## Acceptance Criteria
- [x] Results are ranked by relevance to the search query
- [x] An empty query returns all businesses (not an error)
- [x] Partial name matches are included in results
- [x] Response includes all fields needed to render a business card
