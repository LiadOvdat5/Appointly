# US-12-B-02: AI Generates New Category When No Match Exists

**Feature:** [[F-12-B-AI-Category-Suggestion|F-12-B: AI-Assisted Category Suggestion]]
**Epic:** [[EPIC-12-Smart-Categories|EPIC-12: Smart Categories]]
**Status:** ✅ Done

---

## Story
As a **business owner whose service doesn't fit any existing category**, I want to **request a new category be created, with AI proposing a suitable generic name** so that **the new category is reusable for other similar businesses**.

## Tasks
- `[BE]` Add `POST /categories/request` endpoint accepting `{ description: string }` — creates a `CategoryRequest` record with status `Pending`
- `[DB]` Create `CategoryRequests` table: `Id`, `RequestedByUserId`, `Description`, `AiSuggestedName`, `AiSuggestedIcon` (nullable), `Status` (enum: `Pending`, `Approved`, `Rejected`), `CreatedAt`
- `[BE]` On creation, call the Anthropic API to generate a concise, generic category name and suggest an icon name — store in the record
- `[BE]` Admin can later approve or reject via the admin panel (F-12-C)
- `[FE]` When "None of these fit" is clicked, show a confirmation step: "We'll suggest a new category based on your description and submit it for review"
- `[FE]` After submission, show "Request submitted — you'll be notified when it's approved" (tie to Notification system in EPIC-09 if available)
- `[FE]` In the meantime, allow the owner to skip category assignment or pick the closest existing one

## Acceptance Criteria
- [x] Owner can submit a new category request with their description
- [x] AI proposes a generic, reusable name (not a business-specific name)
- [x] Request is stored as `Pending` and visible in the admin panel
- [x] Owner is not blocked from completing their setup while the request is pending
