# US-08-B-01: Display Reviews List

**Feature:** [[F-08-B-Reviews-On-Business-Page|F-08-B: Reviews on Business Page]]
**Epic:** [[EPIC-08-Reviews-and-Ratings|EPIC-08: Reviews & Ratings]]
**Status:** 🔲 Not Started

---

## Story
As a **customer browsing a business**, I want to **see a list of customer reviews on the business page** so that **I can make an informed decision before booking**.

## Tasks
- `[BE]` `GET /businesses/{businessId}/reviews?page=1&pageSize=10` — paginated list of reviews, newest first
- `[BE]` Response DTO: `{ rating, comment, customerName (first name + last initial), createdAt }`
- `[BE]` Do not expose customer email or full name — only first name + last initial
- `[FE]` Add a "Reviews" section on `PublicBusinessPage` below services
- `[FE]` Show each review as a card: star display, reviewer name, date, comment
- `[FE]` Paginate with "Load more" button
- `[FE]` Show empty state message when business has no reviews yet

## Acceptance Criteria
- [ ] Reviews are shown newest first
- [ ] Customer identity is anonymized (first name + last initial only)
- [ ] Pagination works correctly — loading more appends to the list
- [ ] Empty state is shown when there are no reviews
- [ ] Reviews section is visible to all visitors (no login required)
