# US-02-A-01: Create Business Profile

**Feature:** [[F-02-A-Create-Business|F-02-A: Create Business]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ BE Done

---

## Story
As a **business owner**, I want to **create my business profile with name, description, category, and contact information** so that **customers can find and learn about my business**.

## Tasks
- `[BE]` Implement `POST /businesses` accepting `CreateBusinessDTO` and returning `BusinessDTO`
- `[BE]` Restrict endpoint to users with the `BusinessOwner` role only
- `[DB]` Business table: `Id`, `OwnerId`, `Name`, `Description`, `CategoryId`, `ThemeColor`, `LogoUrl`, `ContactInfo`
- `[FE]` Build business creation form with all required fields

## Acceptance Criteria
- [ ] Only users with the `BusinessOwner` role can call this endpoint (others receive 403)
- [ ] Name and category are required; request fails with 400 if missing
- [ ] Created business is automatically linked to the authenticated user via `OwnerId`
- [ ] Returns full `BusinessDTO` including generated `Id` on success
