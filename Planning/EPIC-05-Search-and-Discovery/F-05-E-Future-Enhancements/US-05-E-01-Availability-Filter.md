# US-05-E-01: Availability Filter

**Feature:** [[F-05-E-Future-Enhancements|F-05-E: Future Enhancements]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **filter search results by availability** (date and optional time range) so that **I can find businesses I can book immediately**.

## Tasks
- `[BE]` ✅ Made `categoryId` optional on `GET /api/search/businesses/by-category-availability` — when omitted, queries all services across all categories
- `[BE]` ✅ Backend already queries `AvailabilitySlots` for the given date/time range per service
- `[FE]` ✅ Added date picker + optional time-range (from / to) to the filters modal in `SearchHeader`
- `[FE]` ✅ Availability filter combines with category filter; `SearchPage` routes to `searchByAvailability()` when a date is set
- `[FE]` ✅ Active date shown as a badge chip on the Filters button
- `[FE]` ✅ Availability date/time state added to Redux slice with `setAvailabilityDate`, `setAvailabilityTime`, `clearAvailabilityFilter` actions
- `[FE]` ✅ Business page slot preview respects the searched date/time window when navigating from an availability search
- `[FE]` ✅ Clearing search also clears the availability filter

## Acceptance Criteria
- [x] Only businesses with available slots on the target date are shown when the filter is active
- [x] Availability filter can be combined with category filters
- [x] Filter chip (badge) clearly shows the active date
