# US-02-C-03: Upload Logo & Banner

**Feature:** [[F-02-C-Owner-Edit-Mode|F-02-C: Owner Edit Mode]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **upload a logo and banner image for my business page** so that **my page looks professional and recognizable to customers**.

## Tasks
- `[BE]` Implement `POST /businesses/{id}/upload-logo` to accept and store image files in file storage
- `[BE]` Store returned URL in `LogoUrl` / `BannerUrl` fields on the Business model
- `[FE]` Build image upload component with file picker and preview before save
- `[FE]` Display uploaded logo and banner on the public business page

## Acceptance Criteria
- [ ] Only image file types are accepted (jpg, png, webp); non-image files are rejected with an error
- [ ] Preview of the uploaded image is shown before the user confirms the upload
- [ ] Logo and banner are displayed on the public page after a successful upload
- [ ] Requires a file storage solution (e.g., AWS S3 or Azure Blob Storage)
