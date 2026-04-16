# US-02-G-04: Show Assigned Person & Conflict Setting on Services & Hours Page

**Feature:** [[F-02-G-Service-Assignment-Rules|F-02-G: Service Assignment Rules & Parallel Booking]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **see who is assigned to a service and manage the parallel-booking conflict preference directly from the Services & Hours edit panel** so that **I don't have to navigate to the Staff Management page just to update these settings**.

## Context
The Services & Hours page already has an edit panel per service (hours, duration, price, etc.). This story adds an "Assigned To" section and a "Block on booking" toggle to that same panel — surfacing the data from US-02-G-01 and US-02-G-03 without requiring extra navigation.

## Tasks

### Frontend
- `[FE]` In the service edit panel on the Services & Hours page, add an **"Assigned To"** row:
  - Displays the assigned staff member's name (and owner badge if applicable), or "Unassigned" if none
  - Includes a **Change** button that opens a single-select staff picker (owner + all active staff members) plus an "Unassign" option
  - On selection, calls `PUT /businesses/{id}/services/{id}/assignment`
- `[FE]` Below the "Assigned To" row, add a **"Block on booking"** toggle (only visible when the assigned person also has at least one other service):
  - Label: "If this service is booked, automatically block overlapping slots for [Staff Name]'s other services"
  - Default state comes from the service's `blockOnBooking` value
  - On change, calls `PATCH /businesses/{id}/services/{id}/assignment/preferences`
  - If the assigned person has only one service (this one), hide the toggle entirely to avoid confusion
- `[FE]` Show a read-only info chip when `blockOnBooking` is `true`: "Conflict protection on" — and "Conflict protection off" when `false`

### Backend
- `[BE]` No new endpoints needed — reuse `GET /businesses/{id}/services/{id}/assignment` and the endpoints from US-02-G-01 and US-02-G-03

## Acceptance Criteria
- [ ] The Services & Hours edit panel shows the current assignee (or "Unassigned") for each service
- [ ] The owner can change the assignee inline without leaving the page
- [ ] The "Block on booking" toggle appears only when the assigned person has 2+ services
- [ ] The toggle correctly reads and writes the `blockOnBooking` preference
- [ ] Changes to assignment or conflict preference are reflected immediately without a full page reload
