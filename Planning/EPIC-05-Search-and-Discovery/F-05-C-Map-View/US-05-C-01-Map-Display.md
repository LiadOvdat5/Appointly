# US-05-C-01: Map Display

**Feature:** [[F-05-C-Map-View|F-05-C: Map View]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **see businesses plotted on a map** so that **I can understand their geographic distribution and proximity to me**.

## Tasks
- `[FE]` Build `SearchMapView` component using Google Maps API
- `[FE]` Implement `useGoogleMaps` hook for lazy API script loading
- `[FE]` Implement `useMapMarkers` hook for marker clustering and placement
- `[FE]` Center the map on the user's detected location by default

## Acceptance Criteria
- [ ] Map is centered on the user's current location on initial load
- [ ] Business markers update when search results change
- [ ] Marker clusters expand on zoom to reveal individual businesses
- [ ] Map renders without errors if user location is denied
