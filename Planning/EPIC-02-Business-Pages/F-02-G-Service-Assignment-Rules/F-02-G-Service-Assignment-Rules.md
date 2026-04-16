# F-02-G: Service Assignment Rules & Parallel Booking

**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Overview

This feature refines how services are assigned to staff members and introduces a parallel booking conflict rule.

**Key changes:**
- Each service has at most **one** assigned staff member (1-to-1 constraint). Staff members can still hold multiple services.
- The **business owner** appears on the Staff Management page in a dedicated "Owner" section and can be assigned/unassigned from services just like any staff member. The owner always retains full management access regardless of assignment status.
- When a staff member is assigned to **two or more services** that share overlapping available time slots, the system needs to know: if one slot is booked, should the matching slot on the other service(s) be automatically blocked? The default answer is **yes**; this preference is configurable per service and surfaces in two places:
  - The **Services & Hours** edit panel for each service (shows who is assigned + conflict preference toggle).
  - The **Staff Management** detail view (informational banner when staff has ≥ 2 services).
- If a booked appointment is cancelled, any slots that were auto-blocked due to this rule are automatically released.

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-02-G-01-One-Staff-Per-Service\|US-02-G-01]] | Enforce one-staff-per-service assignment | ✅ Done |
| [[US-02-G-02-Owner-As-Staff\|US-02-G-02]] | Owner visible and assignable in Staff Management | ✅ Done |
| [[US-02-G-03-Parallel-Booking-Conflict-Preference\|US-02-G-03]] | Configure parallel booking conflict preference | ✅ Done |
| [[US-02-G-04-Assignment-On-Services-Hours-Page\|US-02-G-04]] | Show assigned person & conflict setting on Services & Hours | ✅ Done |
| [[US-02-G-05-Conflict-Banner-On-Staff-Management\|US-02-G-05]] | Informational banner on Staff Management for multi-service staff | ✅ Done |
