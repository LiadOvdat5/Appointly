# US-10-A-02: Add Translation Keys for New Features

**Feature:** [[F-10-A-Translation-Audit|F-10-A: Translation Audit & Hardcoded String Fix]]
**Epic:** [[EPIC-10-Internationalization|EPIC-10: Internationalization (i18n) Hardening]]
**Status:** 🔲 Not Started

---

## Story
As a **developer**, I want to **add i18n translation keys for all new features** so that **Reviews, Notifications, Staff Management, and other new areas are translatable from day one**.

## Tasks
- `[FE]` Add `reviews` namespace keys to `en` and `he` translation files (star labels, submit button, empty states, etc.)
- `[FE]` Add `notifications` namespace keys (notification types, titles, body templates, bell UI labels)
- `[FE]` Add `staff` namespace keys (page titles, invite modal, remove confirmation, service assignment UI)
- `[FE]` Add `sharing` namespace keys (copy link button, share modal, QR code labels)
- `[FE]` Add `categories` namespace keys for AI suggestion flow
- `[FE]` Add `admin` namespace keys for admin panel (if applicable)

## Acceptance Criteria
- [ ] All new features implement `t()` from the start — no hardcoded strings in new feature code
- [ ] Both `en` and `he` dictionaries are updated together when new keys are added
