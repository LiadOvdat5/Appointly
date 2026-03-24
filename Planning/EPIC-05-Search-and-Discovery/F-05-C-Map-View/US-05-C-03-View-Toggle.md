# US-05-C-03: View Toggle

**Feature:** [[F-05-C-Map-View|F-05-C: Map View]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **toggle between list view and map view for search results** so that **I can choose the presentation that best suits my browsing style**.

## Tasks
- `[FE]` Build `SearchViewToggle` component with List/Map toggle buttons
- `[FE]` Toggle state persists for the duration of the session (not reset on each search)
- `[FE]` Both views share the same underlying search state (query, filters, results)

## Acceptance Criteria
- [ ] Toggle switches cleanly between `SearchListView` and `SearchMapView`
- [ ] The selected view persists during the session (switching to a business page and returning keeps the view)
- [ ] Search results and active filters are the same in both views
