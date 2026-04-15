# EPIC-19: App Shell & Global Layout

**Goal:** Provide a consistent, polished app shell across all pages — global header behaviour, a site-wide footer with contact and legal information, and any other layout chrome that spans the entire application.
**Status:** 🔲 Not Started (F-19-A 🔲)

← [[README|Planning Index]]

---

## Features

| # | Feature | Status |
|---|---------|--------|
| A | [[F-19-A-Global-Footer\|Feature A: Global Footer]] | 🔲 Not Started |

---

## Notes

- The footer renders on every route (injected at the `AppShell` level, not per-page).
- Keep the footer lightweight — no heavy data fetching; all content is static or config-driven.
- Legal pages (Privacy Policy, Terms of Service) can be stub routes that are fleshed out later.
