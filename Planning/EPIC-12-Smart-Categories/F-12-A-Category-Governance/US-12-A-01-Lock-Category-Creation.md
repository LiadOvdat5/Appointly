# US-12-A-01: Remove Free-Form Category Creation by Business Owners

**Feature:** [[F-12-A-Category-Governance|F-12-A: Category Governance]]
**Epic:** [[EPIC-12-Smart-Categories|EPIC-12: Smart Categories]]
**Status:** 🔲 Not Started

---

## Story
As an **admin**, I want to **prevent business owners from freely creating new categories** so that **the category list stays clean and reusable across businesses**.

## Tasks
- `[BE]` Remove or restrict the `POST /categories` endpoint so only admins can create categories directly
- `[BE]` Add an `Admin` role to the `UserRole` enum (alongside `BusinessOwner`, `Customer`)
- `[BE]` Gate category creation endpoints behind an `[Authorize(Roles = "Admin")]` attribute
- `[DB]` Migration if `UserRole` enum change requires a schema update

## Acceptance Criteria
- [ ] Business owners cannot call `POST /categories` — receive 403
- [ ] Admin users can still create and manage categories directly
- [ ] Existing categories are unaffected
