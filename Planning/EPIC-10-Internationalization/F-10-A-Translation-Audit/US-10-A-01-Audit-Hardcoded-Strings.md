# US-10-A-01: Identify and Replace Hardcoded Strings

**Feature:** [[F-10-A-Translation-Audit|F-10-A: Translation Audit & Hardcoded String Fix]]
**Epic:** [[EPIC-10-Internationalization|EPIC-10: Internationalization (i18n) Hardening]]
**Status:** ✅ Done

---

## Story
As a **developer**, I want to **ensure no raw English text appears in JSX outside of `t()` calls** so that **the app is fully translatable into any language**.

## Tasks
- `[FE]` Grep all `.tsx`/`.ts` files for string literals in JSX (e.g., text between tags, `placeholder=`, `label=`, `aria-label=`, `title=` attributes that are plain strings)
- `[FE]` For each hardcoded string found, replace it with a `t('namespace.key')` call and add the key to the English (`en`) translation file
- `[FE]` Pay special attention to: error messages, form validation text, button labels, empty state messages, toast/alert messages

## Acceptance Criteria
- [x] No visible user-facing text in `.tsx` files is a plain string literal outside of `t()` calls
- [x] All replaced strings have corresponding keys in `en` translation file
- [x] App renders correctly in English after the migration
