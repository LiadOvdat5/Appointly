# EPIC-17: User Onboarding Tutorials

**Status:** 🔲 Not Started

## Goal
Guide new users through the app with contextual, per-page tutorials that appear the first time a user visits each page. Tutorials are skippable, role-specific, and available in every language supported by the app.

## Design Decision
Tutorials are **per-page, first-time-only** — not a single upfront walkthrough on sign-up.  
Each page a user encounters for the first time shows a guided tooltip/highlight sequence for that page's key actions. This means:
- The customer sees a tutorial on `/search` the first time they visit it, on `/book/...` the first time they book, etc.
- The business owner sees a tutorial on `/onboarding`, `/dashboard`, `/business/:id` edit mode, etc.
- The staff member sees a tutorial on their home page, the schedule editor, etc.

**Tracking:** A set of seen-tutorial flags stored in `localStorage` (key: `tutorials-seen`) and, if logged in, synced to the backend so they persist across devices.

---

## Features

| ID | Feature | Status |
|----|---------|--------|
| [[F-17-A-Tutorial-Framework\|F-17-A]] | Tutorial framework (engine, storage, i18n) | 🔲 Not Started |
| [[F-17-B-Customer-Tutorial\|F-17-B]] | Customer tutorials | 🔲 Not Started |
| [[F-17-C-Owner-Tutorial\|F-17-C]] | Business owner tutorials | 🔲 Not Started |
| [[F-17-D-Staff-Tutorial\|F-17-D]] | Staff member tutorials | 🔲 Not Started |
