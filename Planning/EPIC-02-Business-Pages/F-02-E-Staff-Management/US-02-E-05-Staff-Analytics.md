# US-02-E-05: Staff Member Performance Analytics

**Feature:** [[F-02-E-Staff-Management|F-02-E: Staff Management]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see performance analytics for each staff member** so that **I can understand their contribution to the business**.

## Tasks
- `[BE]` Extend `GET /businesses/{businessId}/staff/{userId}` or add a dedicated `GET /businesses/{businessId}/staff/{userId}/report` endpoint
- `[BE]` Report includes: total appointments handled (all time + current month), revenue generated, completion rate, average rating (once Reviews epic is done)
- `[BE]` Filter by date range (default: current month)
- `[FE]` In the staff member detail view, add an analytics section with stat cards
- `[FE]` Show: appointments count, revenue, completion rate
- `[FE]` Placeholder for "Average Rating" linked to [[EPIC-08-Reviews-and-Ratings|EPIC-08]]

## Acceptance Criteria
- [x]Owner sees total appointments and revenue attributed to each staff member
- [x]Stats default to the current month
- [x]Completion rate (completed / total booked) is shown as a percentage
- [x]Average rating stat card is displayed as a placeholder until Reviews epic is implemented
