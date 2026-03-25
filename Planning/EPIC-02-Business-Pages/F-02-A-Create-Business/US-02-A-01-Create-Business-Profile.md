# US-02-A-01: Create Business Profile

**Feature:** [[F-02-A-Create-Business|F-02-A: Create Business]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **create my business profile with name, description, category, and contact information** so that **customers can find and learn about my business**.

## Tasks
- `[BE]` ✅ Implement `POST /businesses` accepting `CreateBusinessDTO` and returning `BusinessDTO`
- `[BE]` ✅ Restrict endpoint to authenticated users only; any user can create a business (role upgrades to Owner automatically)
- `[BE]` ✅ Auto-enroll the creating user as a `BusinessPartner` (Accepted) so they can immediately be assigned to services
- `[BE]` ✅ `GET /businesses/my` — returns all businesses owned by the authenticated user
- `[DB]` ✅ Business table: `Id`, `OwnerId`, `Name`, `Description`, `CategoryId`, `ThemeColor`, `LogoUrl`, `ContactInfo`
- `[FE]` ✅ Business creation form built as Step 1 of the onboarding wizard

## Acceptance Criteria
- [x] Only authenticated users can call this endpoint (others receive 401)
- [x] Name and address are required; request fails with 400 if missing
- [x] Created business is automatically linked to the authenticated user via `OwnerId`
- [x] Returns full `BusinessDTO` including generated `Id` on success
- [x] Owner is added as a BusinessPartner on create so services can be assigned immediately
