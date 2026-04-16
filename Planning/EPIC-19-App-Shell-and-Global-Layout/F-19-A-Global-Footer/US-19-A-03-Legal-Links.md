# US-19-A-03: Legal & Policy Links

**Feature:** [[F-19-A-Global-Footer|F-19-A: Global Footer]]
**Epic:** [[EPIC-19-App-Shell-and-Global-Layout|EPIC-19: App Shell & Global Layout]]
**Status:** ✅ Done

---

## Story
As a **user**, I want to **find links to the Privacy Policy and Terms of Service in the footer, and be able to read the full content of each**, so that **I understand how my data is used and what I agreed to when signing up**.

## Tasks

### Footer links
- `[FE]` Add a "Legal" section (or column) to the footer with two links: **Privacy Policy** and **Terms of Service**
- `[FE]` Register both routes in `routes.tsx` (public, no auth required): `/privacy` and `/terms`
- `[FE]` Add i18n keys for all footer link labels

### Privacy Policy page (`/privacy`)
- `[FE]` Create `PrivacyPolicyPage.tsx` under `pages/`
- `[FE]` Sections to include:
  1. **Introduction** — what Appointly is and who this policy applies to
  2. **Data We Collect** — account info (name, email, role), business details, appointment data, usage/analytics
  3. **How We Use Your Data** — operating the service, sending booking confirmations, improving the product
  4. **Data Sharing** — we do not sell data; limited sharing with infrastructure providers (e.g. hosting, email)
  5. **Data Retention** — how long data is kept; account deletion process
  6. **Your Rights** — access, correction, deletion requests via `support@appointly.app`
  7. **Cookies** — HTTP-only JWT cookie for auth; no third-party tracking cookies
  8. **Contact** — `support@appointly.app` for privacy questions
  9. **Last Updated** date
- `[FE]` Add i18n keys for all Privacy Policy content

### Terms of Service page (`/terms`)
- `[FE]` Create `TermsOfServicePage.tsx` under `pages/`
- `[FE]` Sections to include:
  1. **Acceptance of Terms** — using the app means you accept these terms
  2. **Description of Service** — appointment booking platform for businesses and customers
  3. **User Accounts** — eligibility (age 16+), accurate information, responsibility for account security
  4. **Business Owner Responsibilities** — accurate service listings, honouring appointments, professional conduct
  5. **Customer Responsibilities** — honouring bookings, reasonable cancellation behaviour
  6. **Prohibited Conduct** — spam, fake accounts, scraping, misuse of the platform
  7. **Intellectual Property** — Appointly owns the platform; users own their own content
  8. **Limitation of Liability** — Appointly is not liable for missed appointments or business disputes
  9. **Termination** — Appointly may suspend accounts that violate these terms
  10. **Changes to Terms** — notice will be given; continued use = acceptance
  11. **Contact** — `support@appointly.app` for legal questions
  12. **Last Updated** date
- `[FE]` Add i18n keys for all Terms of Service content

### Shared
- `[FE]` Both pages use a consistent `LegalPage` layout wrapper: max-width prose container, section headings, back link to previous page
- `[FE]` "Last Updated" date is a constant in the file (not pulled from a server)

## Acceptance Criteria
- [ ] "Privacy Policy" and "Terms of Service" links are present in the footer on all routes
- [ ] Each link navigates to its dedicated route without a full page reload (React Router `<Link>`)
- [ ] Both routes are accessible to unauthenticated users
- [ ] Privacy Policy page contains all 9 sections listed above with real content (not placeholder text)
- [ ] Terms of Service page contains all 12 sections listed above with real content (not placeholder text)
- [ ] Both pages are readable on mobile (320 px) — no horizontal overflow, comfortable line length
- [ ] All strings are in the i18n translation files
- [ ] "Last Updated" date is visible on both pages
