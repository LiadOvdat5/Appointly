# US-17-D-02: Staff – Schedule Editor Tutorial

**Feature:** [[F-17-D-Staff-Tutorial|F-17-D: Staff Member Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** 🔲 Not Started

---

## Story
As a **new staff member**, I want **a tutorial the first time I open the schedule editor** so that **I understand how to set my own availability rules and block dates**.

## Tutorial Steps
1. **Weekly availability** — "Set the days and hours you're available to take appointments."
2. **Break times** — "Block out breaks so you're not booked during lunch or downtime."
3. **Date exceptions** — "Block specific dates when you're unavailable (holiday, day off, etc.)."
4. **Save** — "Save your schedule so customers only see slots when you're truly available."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="staff-schedule-editor" steps={...} />` to the staff-facing schedule editor
- `[FE]` Add i18n keys: `tutorials.staffScheduleEditor.*`

## Acceptance Criteria
- [ ] Tutorial shown on first visit to the schedule editor by a staff member
- [ ] Distinct from the owner schedule editor tutorial (different key)
