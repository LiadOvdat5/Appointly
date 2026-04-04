# US-11-B-02: QR Code for Business Page

**Feature:** [[F-11-B-Share-Business-Page|F-11-B: Share Business Page]]
**Epic:** [[EPIC-11-Sharing-and-URLs|EPIC-11: Sharing & URL Improvements]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **generate a QR code for my business page** so that **I can print it and let walk-in customers scan it to book online**.

## Tasks
- `[FE]` Add a "Show QR Code" option in the share UI (button or tab next to "Copy Link")
- `[FE]` Use a lightweight QR code library (e.g., `qrcode.react`) to render the QR code client-side — no backend call needed
- `[FE]` Display the QR code in a modal with a "Download" button that saves it as a PNG
- `[FE]` QR code encodes the full slug-based business page URL

## Acceptance Criteria
- [x] Owner can open a modal showing the QR code for their business page
- [x] QR code is scannable and leads to the correct business page
- [x] "Download" button saves the QR code as an image file
- [x] No backend calls are needed — QR generation is fully client-side
