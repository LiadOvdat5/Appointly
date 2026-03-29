# US-06-B-04: Followed Businesses

**Feature:** [[F-06-B-Customer-Dashboard|F-06-B: Customer Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** 🔲 Placeholder (blocked by EPIC-07)

---

## Story
As a **customer**, I want to **see the businesses I follow in my dashboard** so that **I can quickly access and re-book my favourite businesses**.

## Tasks
- `[FE]` Build a "Followed Businesses" section in the Customer Dashboard
- `[FE]` Each followed business is shown as a card with a link to their public page and a quick "Book" link
- `[FE]` Include an "Unfollow" option on each card
- `[FE]` Depends on [[EPIC-07-Follow-System|EPIC-07]] being implemented

## Notes
UI placeholder section is present on the customer dashboard with an "Explore businesses" CTA.
Full implementation blocked by [[EPIC-07-Follow-System|EPIC-07]].

## Acceptance Criteria
- [ ] Each followed business is shown as a card with their name and category
- [ ] Quick re-book link is available on each card
- [ ] Unfollow option is available and immediately removes the business from the list
- [x] Empty/placeholder state is shown when follow system is not yet implemented
