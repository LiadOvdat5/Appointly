# US-06-A-02: Stats Overview

**Feature:** [[F-06-A-Business-Dashboard|F-06-A: Business Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see an overview of my business stats including total bookings and revenue** so that **I can track my business performance at a glance**.

## Tasks
- `[BE]` Implement `GET /reports/business/{id}` returning `ReportDTO` with: total appointments, revenue estimate, top service
- `[FE]` Build stat card components in the Business Dashboard: total appointments, revenue, top service
- `[FE]` Default to current month; allow date range selection

## Acceptance Criteria
- [x] Stats reflect the current calendar month by default
- [x] Date range is selectable to adjust the reporting period
- [x] Revenue and booking counts update when the date range changes
- [x] Top service is calculated from the most-booked service in the period

> **Extended:** Analytics are full-width selectable cards with 7 metrics — Total Bookings, Revenue, Top Service, Cancellations (with rate %), Avg Booking Value, Unique Customers, Busiest Day of Week. Backend `ReportDTO` extended accordingly.
