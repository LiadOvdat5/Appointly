# US-05-B-02: Category Filter UI

**Feature:** [[F-05-B-List-View|F-05-B: List View]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **filter search results by category using visual chips** so that **I can intuitively narrow results without typing**.

## Tasks
- `[FE]` Build `CategoryFilter` component that renders category chips loaded from `GET /categories`
- `[FE]` Integrate the category filter into `SearchHeader` as a filter popup/drawer
- `[FE]` Support multiple category selection; update search results on selection change

## Acceptance Criteria
- [x] Category chips display the category icon from `IconName`
- [x] Multiple categories can be selected simultaneously
- [x] Search results update immediately when the category selection changes
- [x] Clearing the filter returns all results
