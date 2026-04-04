# US-11-B-01: Copy Business Page Link to Clipboard

**Feature:** [[F-11-B-Share-Business-Page|F-11-B: Share Business Page]]
**Epic:** [[EPIC-11-Sharing-and-URLs|EPIC-11: Sharing & URL Improvements]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **copy a direct link to my business page** so that **I can share it with customers via WhatsApp, social media, or any other channel**.

## Tasks
- `[FE]` Add a "Share" or "Copy Link" button on the public business page (visible to the owner when in owner view, and also visible to all logged-in users as a general share affordance)
- `[FE]` On click, copy `window.location.origin + /business/{slug}` to clipboard using the Clipboard API
- `[FE]` Show a brief "Link copied!" toast/confirmation after successful copy
- `[FE]` Also add a share button in the owner's business dashboard

## Acceptance Criteria
- [x] Clicking the share button copies the full slug-based URL to the clipboard
- [x] "Link copied!" feedback is shown and disappears after ~2 seconds
- [x] The copied URL is the clean slug URL, not a UUID URL
- [x] Works on modern browsers (Clipboard API); shows a fallback prompt on unsupported browsers
