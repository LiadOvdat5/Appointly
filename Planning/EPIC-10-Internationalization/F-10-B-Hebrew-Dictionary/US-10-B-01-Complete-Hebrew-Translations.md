# US-10-B-01: Complete Hebrew Translation Dictionary

**Feature:** [[F-10-B-Hebrew-Dictionary|F-10-B: Hebrew Dictionary Completion]]
**Epic:** [[EPIC-10-Internationalization|EPIC-10: Internationalization (i18n) Hardening]]
**Status:** 🔲 Not Started

---

## Story
As a **Hebrew-speaking user**, I want to **see the entire app in Hebrew with no untranslated placeholders or English fallbacks** so that **the app feels native to me**.

## Tasks
- `[FE]` Compare the `en` and `he` translation files key-by-key; identify every key present in `en` but missing or empty in `he`
- `[FE]` Translate all missing keys into Hebrew — use natural, conversational phrasing appropriate for a service-booking app
- `[FE]` Ensure plural forms are handled correctly (Hebrew has dual and plural forms for some words)
- `[FE]` After completing translations, switch the app to Hebrew and manually verify all pages render correctly without fallbacks

## Acceptance Criteria
- [ ] Every key in `en` has a corresponding, non-empty key in `he`
- [ ] Switching the app to Hebrew shows no English text fallbacks on any page
- [ ] Translated text fits within UI components without overflow (spot-check key components)
