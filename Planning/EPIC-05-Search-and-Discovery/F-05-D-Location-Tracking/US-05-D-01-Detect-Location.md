# US-05-D-01: Detect Location

**Feature:** [[F-05-D-Location-Tracking|F-05-D: Location Tracking]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want the **app to detect my location** so that **search results are sorted by proximity and the map is centered on my position**.

## Tasks
- `[FE]` Implement `useLocationTracking` hook using the browser Geolocation API
- `[FE]` Store detected coordinates in Redux location state
- `[FE]` Pass `lat` and `lng` to the search API to sort results by distance
- `[FE]` Handle the case where the user denies location permission gracefully

## Acceptance Criteria
- [ ] A browser permission prompt is shown when location is first requested
- [ ] Detected location is used to sort search results by distance
- [ ] If location permission is denied, the app still works without location-based sorting
- [ ] Location state is available across the search, list, and map views
