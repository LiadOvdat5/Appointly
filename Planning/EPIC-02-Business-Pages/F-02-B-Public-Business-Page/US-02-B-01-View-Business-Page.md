# US-02-B-01: View Business Page

**Feature:** [[F-02-B-Public-Business-Page|F-02-B: Public Business Page]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **view a business's public page** so that **I can learn about the business and decide whether to book an appointment**.

## Tasks
- `[BE]` Implement `GET /businesses/{id}` returning `BusinessDTO` including services
- `[FE]` Create route `/business/:businessId` rendering `PublicBusinessPage.tsx`
- `[FE]` Display: business name, description, category, contact info, logo/banner

## Acceptance Criteria
- [x] Page loads correctly for any valid `businessId`
- [x] HTTP 404 is shown for an invalid or non-existent `businessId`
- [x] No edit controls or owner-only UI elements are visible to customers
- [x] Page is accessible without authentication
