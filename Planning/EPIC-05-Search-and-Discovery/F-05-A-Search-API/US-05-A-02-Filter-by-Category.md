# US-05-A-02: Filter by Category

**Feature:** [[F-05-A-Search-API|F-05-A: Search API]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **filter businesses by category** so that **I can narrow search results to the type of service I am looking for**.

## Tasks
- `[BE]` Implement `GET /categories` returning `CategoryDTO[]` with `IconName` field
- `[DB]` Category table includes `IconName` field for dynamic icon rendering on the frontend
- `[BE]` `GET /search?category=` filters results by the specified category

## Acceptance Criteria
- [ ] Categories are loaded dynamically from the backend (not hardcoded on the frontend)
- [ ] Filtering by category updates search results in real time
- [ ] Each category returns its `IconName` for use in the UI
