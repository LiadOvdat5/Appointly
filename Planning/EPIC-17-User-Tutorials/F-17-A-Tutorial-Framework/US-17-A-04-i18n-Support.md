# US-17-A-04: Tutorial Text in All App Languages

**Feature:** [[F-17-A-Tutorial-Framework|F-17-A: Tutorial Framework]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **user whose preferred language is not English**, I want **tutorials to appear in the same language as the rest of the app** so that **the guidance is understandable to me**.

## Tasks
- `[FE]` All tutorial step titles and body text are i18next translation keys (namespace `tutorials`)
- `[FE]` Add tutorial translation keys to every language file currently in `src/languages/` (e.g., `en.json`, `he.json`, ...)
- `[FE]` Tutorial direction (LTR/RTL) follows the app's active language direction
- `[FE]` Tooltip layout adjusts for RTL: back/next button order mirrors

## Acceptance Criteria
- [ ] Switching app language before or during a tutorial updates tutorial text immediately
- [ ] Tutorial renders correctly in RTL languages (Hebrew, Arabic, etc.)
- [ ] No tutorial step contains hardcoded English text
