# US-05-B-01: Business Cards

**Feature:** [[F-05-B-List-View|F-05-B: List View]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **see search results displayed as business cards** so that **I can quickly scan and compare businesses**.

## Tasks
- `[FE]` Build `SearchListView` component rendering a list of `BusinessCard` components
- `[FE]` `BusinessCard` displays: business name, category, distance from user, and next available slot
- `[FE]` Show loading skeletons while results are fetching
- `[FE]` Clicking a card navigates to `/business/:id`

## Acceptance Criteria
- [x] All returned search result fields are rendered on the card
- [x] Clicking a business card navigates to the correct public business page
- [x] Loading skeleton is shown while search results are being fetched
- [x] Empty state is shown if no results match the search query
