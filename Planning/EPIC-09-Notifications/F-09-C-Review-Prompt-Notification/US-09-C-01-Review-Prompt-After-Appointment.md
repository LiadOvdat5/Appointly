# US-09-C-01: Review Prompt After Completed Appointment

**Feature:** [[F-09-C-Review-Prompt-Notification|F-09-C: Post-Appointment Review Prompt]]
**Epic:** [[EPIC-09-Notifications|EPIC-09: Notifications]]
**Status:** 🔲 Not Started

---

## Story
As a **customer**, I want to **receive a notification after my appointment time passes prompting me to leave a review** so that **I am reminded to share my experience**.

## Tasks
- `[BE]` Extend the hourly background job (from US-09-B-03) to also check for appointments that ended in the last 1–2 hours and have no review yet and no review prompt sent
- `[DB]` Add `ReviewPromptSentAt` (nullable DateTime) to `Appointments` table
- `[BE]` Create `ReviewPrompt` notification for the customer: "How was your appointment at {BusinessName}? Leave a review!", `RelatedEntityId = appointmentId`
- `[BE]` Set `ReviewPromptSentAt = now` to prevent duplicate prompts
- `[FE]` Clicking the review prompt notification navigates to the customer dashboard with the review modal pre-opened for that appointment

## Acceptance Criteria
- [ ] Customer receives exactly one review prompt per completed appointment
- [ ] Prompt is only sent after the appointment end time has passed
- [ ] If customer already left a review, no prompt is sent
- [ ] Clicking the notification opens the review submission UI directly
- [ ] Depends on [[EPIC-08-Reviews-and-Ratings|EPIC-08]] being implemented (reviews must exist before prompts are meaningful)
