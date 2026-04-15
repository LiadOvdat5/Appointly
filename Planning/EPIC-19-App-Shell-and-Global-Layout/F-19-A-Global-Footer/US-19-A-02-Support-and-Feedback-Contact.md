# US-19-A-02: Support & Feedback Contact

**Feature:** [[F-19-A-Global-Footer|F-19-A: Global Footer]]
**Epic:** [[EPIC-19-App-Shell-and-Global-Layout|EPIC-19: App Shell & Global Layout]]
**Status:** ✅ Done

---

## Story
As a **user who encountered a bug or has a feature idea**, I want to **find a clear contact email in the footer** so that **I know exactly how to reach the BizSlot team without hunting through the site**.

## Tasks
- `[FE]` Add a "Contact / Feedback" section to the footer
- `[FE]` Display a `mailto:` link for bug reports: label **"Report a bug"** → `support@bizslot.app`
- `[FE]` Display a `mailto:` link for feature requests: label **"Suggest a feature"** → `feedback@bizslot.app` (can point to the same address initially — just use separate labels for clarity)
- `[FE]` Optionally pre-fill email subject via `mailto:` query params (e.g. `?subject=Bug Report` / `?subject=Feature Request`)
- `[FE]` Add a short tagline in the section, e.g. *"We read every message."*
- `[FE]` Add i18n keys for labels and tagline

## Acceptance Criteria
- [ ] Both email links are visible in the footer on all screen sizes
- [ ] Clicking each link opens the user's mail client with the correct pre-filled `To` address and subject
- [ ] Links are keyboard-focusable and have descriptive accessible labels (`aria-label`)
- [ ] Email addresses are stored in a single constants file so they can be updated in one place
