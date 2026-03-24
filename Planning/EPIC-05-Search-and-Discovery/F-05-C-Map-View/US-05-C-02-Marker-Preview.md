# US-05-C-02: Marker Preview

**Feature:** [[F-05-C-Map-View|F-05-C: Map View]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **click a map marker and see a business preview card** so that **I can get key information about a business without leaving the map**.

## Tasks
- `[FE]` Build `BusinessMapCard` popup component that appears on marker click
- `[FE]` Popup displays: business name, category, distance from user
- `[FE]` Include a "View" button that navigates to the public business page

## Acceptance Criteria
- [ ] Clicking a marker opens the `BusinessMapCard` popup
- [ ] Popup shows business name, category, and distance
- [ ] "View" button navigates to `/business/:id`
- [ ] Clicking elsewhere on the map closes the popup
