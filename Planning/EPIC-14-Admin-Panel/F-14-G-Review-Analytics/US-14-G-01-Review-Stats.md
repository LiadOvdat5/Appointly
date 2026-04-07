# US-14-G-01: Platform-Wide Review Analytics

**Feature:** [[F-14-G-Review-Analytics|F-14-G: Admin Review Analytics]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** 🔲 Not Started

---

## Story
As an **admin**, I want to **see analytics for all reviews on the platform** so that **I can understand review volume, the overall platform rating, which businesses are most reviewed, and which businesses are rated highest or lowest**.

---

## Tasks

### Backend
- `[BE]` `GET /admin/reviews/analytics` — returns the full analytics payload:
  - `totalReviews` — all-time count (excluding removed reviews)
  - `platformAverageRating` — average rating across all non-removed reviews (1 decimal)
  - `ratingDistribution` — count per star level: `{ "1": 40, "2": 55, "3": 120, "4": 310, "5": 480 }`
  - `topBusinessesByReviewCount` — top 10 most-reviewed businesses: `[ { businessId, name, slug, reviewCount, averageRating } ]`
  - `topRatedBusinesses` — top 5 highest-average-rated businesses (min 3 reviews): `[ { businessId, name, slug, reviewCount, averageRating } ]`
  - `lowestRatedBusinesses` — bottom 5 lowest-average-rated businesses (min 3 reviews): `[ { businessId, name, slug, reviewCount, averageRating } ]`
  - `flagStats` — `{ totalFlagged, pendingFlags, resolvedRemoved, resolvedDismissed }`
  - `reviewsByMonth` — last 12 months: `[ { month: "2025-03", count } ]`

### Frontend
- `[FE]` New page `AdminReviewsPage.tsx` at `/admin/reviews`
- `[FE]` Summary stat cards row: Total Reviews, Platform Average (with star icon), Pending Flags (with link to `/admin/flagged-reviews` if > 0)
- `[FE]` Rating distribution — horizontal bar chart per star level (1–5), CSS-based
- `[FE]` "Top Businesses by Review Count" — ranked list (top 10) with count + average rating
- `[FE]` "Top Rated Businesses" — ranked list (top 5) with average rating + review count
- `[FE]` "Lowest Rated Businesses" — ranked list (bottom 5), styled with a subtle warning color
- `[FE]` "Reviews by Month" — last 12 months shown as a simple CSS bar chart
- `[FE]` Flag stats summary: total flagged, pending, removed, dismissed — as a compact info row
- `[FE]` Update "Reviews" card on `AdminDashboardPage` to link to `/admin/reviews` (instead of `/admin/flagged-reviews`)
- `[FE]` Register `/admin/reviews` route in `routes.tsx`

---

## Data Shape (Backend Response)

```json
{
  "totalReviews": 1005,
  "platformAverageRating": 4.2,
  "ratingDistribution": { "1": 40, "2": 55, "3": 120, "4": 310, "5": 480 },
  "topBusinessesByReviewCount": [
    { "businessId": "...", "name": "Fade Factory", "slug": "fade-factory", "reviewCount": 142, "averageRating": 4.5 }
  ],
  "topRatedBusinesses": [
    { "businessId": "...", "name": "Glow Nails", "slug": "glow-nails", "reviewCount": 38, "averageRating": 4.9 }
  ],
  "lowestRatedBusinesses": [
    { "businessId": "...", "name": "Quick Cuts", "slug": "quick-cuts", "reviewCount": 12, "averageRating": 2.1 }
  ],
  "flagStats": {
    "totalFlagged": 28,
    "pendingFlags": 5,
    "resolvedRemoved": 14,
    "resolvedDismissed": 9
  },
  "reviewsByMonth": [
    { "month": "2025-05", "count": 62 },
    { "month": "2025-06", "count": 78 }
  ]
}
```

---

## Acceptance Criteria
- [ ] All counts and averages reflect live DB data (removed reviews excluded)
- [ ] Rating distribution sums to `totalReviews`
- [ ] Monthly chart covers exactly the last 12 calendar months, padded with 0 for empty months
- [ ] Top/lowest rated lists require minimum 3 reviews to qualify
- [ ] Pending flags count is highlighted and links to `/admin/flagged-reviews`
- [ ] Page is accessible only to users with `admin` role
- [ ] Loading skeleton shown while data fetches
- [ ] Error state shown if the API call fails
