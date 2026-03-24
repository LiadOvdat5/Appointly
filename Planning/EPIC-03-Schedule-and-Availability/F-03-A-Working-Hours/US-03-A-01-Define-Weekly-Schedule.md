# US-03-A-01: Define Weekly Schedule

**Feature:** [[F-03-A-Working-Hours|F-03-A: Working Hours]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ BE Done

---

## Story
As a **business owner**, I want to **define my weekly working hours per service** so that **customers can only book during hours I am actually available**.

## Tasks
- `[BE]` Implement `POST /businesses/{businessId}/services/{serviceId}/schedule` accepting `CreateScheduleDTO` and returning `ScheduleDTO`
- `[DB]` Create `WeeklyWorkingRule` model to store day-of-week, start time, and end time
- `[DB]` Create `AvailabilityRule` model to tie working rules to a specific service
- `[BE]` Detect and prevent conflicting schedule entries for the same day

## Acceptance Criteria
- [ ] Each day of the week can have independent working hours
- [ ] Hours are saved and scoped per service (not shared across all services by default)
- [ ] Conflicting schedule entries for the same day are detected and rejected
