# US-18-A-02: "Add to Calendar" Button on Appointment Views

**Feature:** [[F-18-A-Google-Calendar-Export|F-18-A: Add to Google Calendar]]
**Epic:** [[EPIC-18-Calendar-Integration|EPIC-18: Calendar Integration]]
**Status:** ✅ Done

---

## Story
As a **customer, business owner, or staff member**, I want **an "Add to Google Calendar" button next to any appointment** so that **I can add it to my calendar with one click from anywhere in the app**.

## Surfaces to add the button
| Surface | User |
|---------|------|
| Booking confirmation screen | Customer |
| Customer dashboard — upcoming appointments list | Customer |
| Owner dashboard — upcoming appointments list | Business Owner |
| Staff home page — next appointment & appointments list | Staff Member |

## Tasks
- `[FE]` Create a reusable `<AddToCalendarButton appointment={...} />` component
- `[FE]` Button opens a small dropdown: "Google Calendar" / "Download .ics"
- `[FE]` "Google Calendar" option opens the Google Calendar URL in a new tab
- `[FE]` ".ics" option triggers the `.ics` blob download (see US-18-A-03)
- `[FE]` Button has `aria-label="Add appointment to calendar"` and is keyboard accessible
- `[FE]` Place `<AddToCalendarButton>` in:
  - `BookingConfirmation` component
  - Customer dashboard appointment list item
  - Owner dashboard appointment list item
  - Staff home upcoming appointment card

## Acceptance Criteria
- [x] "Add to Calendar" button is visible on all appointment surfaces listed above
- [x] Clicking "Google Calendar" opens the pre-filled Google Calendar page in a new tab
- [x] Clicking ".ics" downloads a valid calendar file
- [x] Button is accessible (keyboard, screen reader)
