# F-01-F: Google OAuth — Sign Up & Login

**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** 🔲 Not Started

---

## Overview

Allow users to sign up and log in using their Google account via OAuth 2.0.
On first Google sign-in the backend creates a new `User` record (no password).
On subsequent sign-ins the existing record is found by Google ID or email.
After OAuth completes the backend issues the same HTTP-only JWT cookie as with
credential login — so the rest of the app works unchanged.

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-01-F-01-Sign-Up-with-Google\|US-01-F-01]] | Sign up with Google | 🔲 Not Started |
| [[US-01-F-02-Login-with-Google\|US-01-F-02]] | Log in with Google | 🔲 Not Started |

---

## Notes

- Use Google Identity Services (`@react-oauth/google`) on the frontend — renders the official Google button and returns an `id_token`.
- Backend validates the `id_token` via Google's tokeninfo endpoint (no extra library needed), then creates/finds the user and issues the JWT cookie.
- A Google-registered user has no `passwordHash`; `passwordHash` column must be made nullable (migration required).
- Role selection still required on first Google sign-up — redirect to role-selection step after the OAuth callback.
- Google Cloud Console setup: create OAuth 2.0 Client ID (Web application), add `http://localhost:5173` to authorised origins. Free — no cost.
