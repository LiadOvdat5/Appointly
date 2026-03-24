# US-03-A-03: Visual Schedule Editor

**Feature:** [[F-03-A-Working-Hours|F-03-A: Working Hours]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** 🔲 FE Pending

---

## Story
As a **business owner**, I want to **use a visual weekly schedule editor** so that **I can intuitively configure my working hours and breaks without dealing with raw data forms**.

## Tasks
- `[FE]` Build a weekly schedule editor component with a row per day of the week
- `[FE]` Each day row has an on/off toggle, a time range picker (start/end), and a section for adding break slots
- `[FE]` Save changes per-day to `POST /businesses/{businessId}/services/{serviceId}/schedule`

## Acceptance Criteria
- [ ] Each day can be individually toggled on (working) or off (closed)
- [ ] Time pickers enforce valid ranges (e.g., start must be before end)
- [ ] Break time pickers enforce that breaks fall within the working hours for the day
- [ ] Changes are saved per-day and confirmed with a success message
