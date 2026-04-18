# US-07-C-01: Broadcast API — Fan-out Notifications to Followers

**Feature:** [[F-07-C-Broadcast-to-Followers|F-07-C: Broadcast to Followers]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** 🔲 Not Started

---

## Story
As the **system**, I want to **receive a broadcast request from a business owner and fan-out an in-app notification to every follower** so that **all followers are informed without blocking the owner's request**.

## Tasks
- `[DB]` Create `Broadcasts` table: `Id`, `BusinessId`, `Title`, `Body`, `SentAt`, `FollowerCount` (snapshot of recipients at send time)
- `[DB]` Migration
- `[BE]` Add `BusinessBroadcast` to `NotificationType` enum
- `[BE]` `POST /businesses/{businessId}/broadcasts`
  - Auth: owner of the business only
  - Body: `{ title: string, body: string }`
  - Validates title ≤ 100 chars, body ≤ 500 chars
  - Rate-limit: max 3 broadcasts per business per 24 hours (check `Broadcasts` table)
  - Saves a `Broadcast` record
  - Enqueues background job to fan-out `Notification` records to all followers
  - Returns `202 Accepted` immediately
- `[BE]` Background fan-out job: fetches all followers of the business, creates one `Notification` per follower (`Type = BusinessBroadcast`, `RelatedEntityId = broadcastId`, `TargetPath = /business/{businessId}`)
- `[BE]` `GET /businesses/{businessId}/broadcasts` — returns paginated broadcast history (owner only), newest first

## Acceptance Criteria
- [ ] Only the business owner can send a broadcast to their followers
- [ ] A business cannot send more than 3 broadcasts in any rolling 24-hour window; returns `429 Too Many Requests`
- [ ] The HTTP request returns `202` before fan-out completes — fan-out is async
- [ ] Each follower receives exactly one in-app notification per broadcast (no duplicates on retry)
- [ ] Broadcast history is stored and retrievable by the owner
- [ ] Title and body length are validated; returns `400` if exceeded
