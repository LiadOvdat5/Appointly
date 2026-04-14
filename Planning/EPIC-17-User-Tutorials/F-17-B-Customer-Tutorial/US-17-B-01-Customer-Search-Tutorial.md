# US-17-B-01: Customer – Search Page Tutorial

**Feature:** [[F-17-B-Customer-Tutorial|F-17-B: Customer Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** 🔲 Not Started

---

## Story
As a **new customer**, I want **a guided tutorial the first time I open the search page** so that **I understand how to find a business and filter results**.

## Tutorial Steps
1. **Welcome** — "Find the right business for you. Let's show you around."
2. **Search bar** — "Type a business name or service (e.g., 'barber', 'nails')."
3. **Category filter** — "Filter by category to narrow your results."
4. **Business card** — "Click a card to view the business and book an appointment."
5. **Map / List toggle** — "Switch between list and map view to find businesses near you."
6. **Location button** — "Allow location access to sort results by distance."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="search" steps={...} />` to `SearchPage`
- `[FE]` Add i18n keys: `tutorials.search.*` in all language files
- `[FE]` Target selectors: search input, category filter bar, first business card, view toggle, location button

## Acceptance Criteria
- [ ] Tutorial shows on first visit to `/search` by a customer
- [ ] Does not show again after completion or skip
- [ ] Steps correctly highlight the intended elements
