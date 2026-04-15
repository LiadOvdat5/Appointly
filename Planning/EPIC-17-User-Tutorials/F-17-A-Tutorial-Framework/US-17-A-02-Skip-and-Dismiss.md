# US-17-A-02: Skip and Dismiss Tutorials

**Feature:** [[F-17-A-Tutorial-Framework|F-17-A: Tutorial Framework]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **user**, I want to **skip or dismiss a tutorial at any point** so that **I am never forced through guidance I don't need**.

## Tasks
- `[FE]` Every tutorial step has a prominent "Skip" button
- `[FE]` Skipping marks the page tutorial as seen (will not show again)
- `[FE]` Completing all steps also marks the tutorial as seen
- `[FE]` Pressing `Escape` skips the tutorial
- `[FE]` Consider: a "Replay tutorial" option in user settings or a help menu so users can re-trigger a tutorial if desired

## Acceptance Criteria
- [ ] Clicking "Skip" at any step immediately closes the tutorial
- [ ] Pressing `Escape` closes the tutorial
- [ ] Skipped or completed tutorials never auto-show again
- [ ] User can manually replay a tutorial from settings (optional, stretch goal)
