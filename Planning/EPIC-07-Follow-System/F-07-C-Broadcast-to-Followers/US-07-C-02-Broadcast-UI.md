# US-07-C-02: "Message Followers" Action in Business Dashboard

**Feature:** [[F-07-C-Broadcast-to-Followers|F-07-C: Broadcast to Followers]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **compose and send a message to all my followers from the dashboard** so that **I can communicate promotions or schedule changes without leaving the app**.

## Tasks
- `[FE]` Add a "Message Followers" button to the business dashboard (e.g., near the follower count stat)
- `[FE]` Clicking opens a modal with:
  - Title input (required, max 100 chars)
  - Body textarea (required, max 500 chars, char counter shown)
  - Follower count preview: "This will be sent to X followers"
  - "Send" button with loading state
  - Rate-limit feedback: if quota is exhausted, show "You can send X more message(s) today" or a disabled state with reset time
- `[FE]` On success: show toast "Message sent to {N} followers", close modal
- `[FE]` On `429`: show "You've reached today's broadcast limit. Try again after {time}."
- `[FE]` In the notification bell, `BusinessBroadcast` type renders with a megaphone icon and links to the business page

## Acceptance Criteria
- [ ] Owner can compose and send a broadcast in under 5 taps/clicks
- [ ] Character limits are enforced client-side with real-time feedback
- [ ] Rate-limit state is shown clearly — no silent failures
- [ ] Notification bell handles `BusinessBroadcast` type without errors (icon + correct link)
- [ ] Followers who receive the notification see the business name, message title, and body in the notification list
