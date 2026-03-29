# US-10-D-01: Sunday as First Day of Week in Hebrew

**Feature:** [[F-10-D-Calendar-Locale|F-10-D: Calendar Locale (Week Start Day)]]
**Epic:** [[EPIC-10-Internationalization|EPIC-10: Internationalization (i18n) Hardening]]
**Status:** 🔲 Not Started

---

## Story
As a **Hebrew-speaking user**, I want to **see Sunday as the first day of the week in all calendars and date pickers** so that **the calendar matches the Israeli standard week layout**.

## Tasks
- `[FE]` Identify all date picker / calendar components in the app (`AvailableDatePicker`, schedule editor calendar, any booking date selectors)
- `[FE]` Pass locale-aware `weekStartsOn` configuration: `0` (Sunday) when language is Hebrew, `1` (Monday) for English
- `[FE]` If using a date-fns locale, use `he` locale with the correct week start; configure the calendar library accordingly
- `[FE]` Day headers in the calendar (Sun/Mon/Tue…) should also be translated to Hebrew (ראשון/שני/שלישי…) using the `he` translation keys

## Acceptance Criteria
- [ ] In Hebrew mode, all calendars start the week on Sunday
- [ ] In English mode, all calendars start the week on Monday
- [ ] Day header labels are translated to Hebrew when the language is Hebrew
- [ ] No visual regression occurs in English mode after the change
