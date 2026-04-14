# US-17-C-04: Owner – Schedule Editor Tutorial

**Feature:** [[F-17-C-Owner-Tutorial|F-17-C: Business Owner Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want **a tutorial the first time I open the schedule editor** so that **I understand how to define weekly rules, break times, and date exceptions**.

## Tutorial Steps
1. **Weekly rules** — "Set your regular working hours for each day of the week."
2. **Break times** — "Add breaks (e.g., lunch) within your working hours."
3. **Date exceptions** — "Block specific dates — holidays, vacations, or days off."
4. **Save** — "Don't forget to save your schedule so customers see accurate availability."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="schedule-editor" steps={...} />` to the schedule editor page/section
- `[FE]` Add i18n keys: `tutorials.scheduleEditor.*`

## Acceptance Criteria
- [ ] Tutorial shows on first visit to the schedule editor
- [ ] Steps highlight weekly rules, break times, and date exceptions sections
