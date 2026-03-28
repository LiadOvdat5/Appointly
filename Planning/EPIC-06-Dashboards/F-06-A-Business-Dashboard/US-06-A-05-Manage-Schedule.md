# US-06-A-05: Manage Schedule

**Feature:** [[F-06-A-Business-Dashboard|F-06-A: Business Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **manage my schedule directly from the dashboard** so that **I can adjust working hours and block dates without leaving the dashboard**.

## Tasks
- `[FE]` Add a "Schedule Settings" panel or tab in the Business Dashboard
- `[FE]` Embed or link to the visual schedule editor from [[US-03-A-03-Visual-Schedule-Editor|US-03-A-03]]
- `[FE]` Include the date exception calendar from [[US-03-B-02-Block-Dates-UI|US-03-B-02]]

## Acceptance Criteria
- [x] Working hours are editable directly from the dashboard
- [x] Date exceptions (blocked dates) are manageable from the dashboard
- [x] Changes are reflected immediately in slot generation

> **Design decision:** Implemented as a dedicated `ServiceSelectionPage` (`/dashboard/:businessId/services`) linked from the "Services & Hours" manage card. Selecting a service navigates to `ScheduleEditorPage` which covers weekly rules, breaks, blocked dates, date exceptions, recurring rules, slot generation, and impact analysis for all changes.
