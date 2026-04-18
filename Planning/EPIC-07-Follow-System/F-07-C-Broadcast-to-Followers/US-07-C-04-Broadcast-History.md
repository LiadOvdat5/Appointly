# US-07-C-04: Broadcast History Tab in Dashboard

**Feature:** [[F-07-C-Broadcast-to-Followers|F-07-C: Broadcast to Followers]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **see a history of all broadcasts I have sent** so that **I can review past messages and track what I've communicated to followers**.

## Tasks
- `[FE]` Add a "Broadcasts" tab or section in the business dashboard (alongside appointments, analytics, etc.)
- `[FE]` Fetch `GET /businesses/{businessId}/broadcasts` (paginated, newest first)
- `[FE]` Each row shows: sent date/time, title, body preview (truncated), and follower count at time of send
- `[FE]` Empty state: "No broadcasts sent yet. Use 'Message Followers' to reach your audience."
- `[FE]` Pagination or infinite scroll for owners with many broadcasts

## Acceptance Criteria
- [ ] All past broadcasts are listed, newest first
- [ ] Each entry shows when it was sent and how many followers received it
- [ ] Empty state is shown clearly when no broadcasts exist
- [ ] The list is paginated — does not load all history at once
