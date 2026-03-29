# US-12-A-02: Business Owner Selects from Curated Category List

**Feature:** [[F-12-A-Category-Governance|F-12-A: Category Governance]]
**Epic:** [[EPIC-12-Smart-Categories|EPIC-12: Smart Categories]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **pick a category from an existing curated list when setting up my business or service** so that **my business is correctly categorized**.

## Tasks
- `[FE]` In the onboarding wizard and service management UI, replace any free-text category input with a searchable dropdown of existing categories
- `[FE]` Categories are loaded from `GET /categories` (already exists)
- `[FE]` Add a search/filter input inside the dropdown so owners can type to narrow down the list
- `[FE]` If the owner cannot find a matching category, show a "Can't find your category? Describe it →" option that leads into the AI suggestion flow (F-12-B)

## Acceptance Criteria
- [ ] Category selection is a searchable list, not a free-text input
- [ ] All existing categories are available in the list
- [ ] "Can't find your category?" option is clearly visible at the bottom of the list
- [ ] Selecting a category from the list saves correctly to the business/service
