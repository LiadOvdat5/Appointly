# US-05-E-01: Availability Filter

**Feature:** [[F-05-E-Future-Enhancements|F-05-E: Future Enhancements]]
**Epic:** [[EPIC-05-Search-and-Discovery|EPIC-05: Search & Discovery]]
**Status:** 🔲 Not Started

---

## Story
As a **customer**, I want to **filter search results by availability** (e.g., "available today") so that **I can find businesses I can book immediately**.

## Tasks
- `[BE]` Extend search endpoint to accept an availability filter parameter (e.g., `availableToday=true`)
- `[BE]` Query slot generation for each result business to determine if slots exist for the target date
- `[FE]` Add an "Available Today" (or date-based) filter chip to `CategoryFilter`
- `[FE]` Combine availability filter with existing category filter

## Acceptance Criteria
- [ ] Only businesses with available slots on the target date are shown when the filter is active
- [ ] Availability filter can be combined with category filters
- [ ] Filter chip clearly shows it is active
