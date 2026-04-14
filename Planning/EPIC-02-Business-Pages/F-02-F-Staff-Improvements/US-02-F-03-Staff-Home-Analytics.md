# US-02-F-03: Staff Home Page Quick Analytics

**Feature:** [[F-02-F-Staff-Improvements|F-02-F: Staff Improvements]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **staff member**, I want **my home page to show a quick snapshot of my upcoming work and activity** so that **I can start my day with a clear picture of what's ahead without navigating to multiple sections**.

## Widgets to show
| Widget | Detail |
|--------|--------|
| **Next appointment** | Time, customer name, service name — prominently displayed |
| **Today's appointments** | Count and a mini-list of today's remaining slots |
| **This week** | Total appointments count for the current week |
| **Assigned services** | List of services this staff member performs, with duration and price |
| **Workplace card** | Business name, logo, and a link to the public business page |

## Tasks
- `[BE]` `GET /partners/me/stats` endpoint returning: `{ nextAppointment, todayCount, weekCount, assignedServices, business }`
- `[BE]` `nextAppointment` includes: `dateTime`, `customerName`, `serviceName`, `durationMinutes`
- `[FE]` Redesign `PartnerHomePage` to display the widgets above as a dashboard-style grid
- `[FE]` "Next appointment" card is visually prominent (large, top of page)
- `[FE]` Assigned services rendered as cards with service name, duration, price
- `[FE]` Empty state if no upcoming appointments: "You have no upcoming appointments. Enjoy your free time!"

## Acceptance Criteria
- [ ] Staff home page shows next appointment, today's count, and week's count
- [ ] Assigned services list is accurate and reflects current assignments
- [ ] Workplace card links to the correct business page
- [ ] Empty states are handled gracefully for each widget
- [ ] Page loads efficiently — single API call preferred over multiple
