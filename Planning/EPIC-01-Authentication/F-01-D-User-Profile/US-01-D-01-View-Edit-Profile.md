# US-01-D-01: View & Edit Profile

**Feature:** [[F-01-D-User-Profile|F-01-D: User Profile]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** 🔲 Not Started

---

## Story
As a **user**, I want to **view and edit my profile including name, email, and password** so that **I can keep my account information up to date**.

## Tasks
- `[BE]` Implement `GET /users/{id}` to return the user's profile data
- `[BE]` Implement `PUT /users/{id}` accepting `UpdateUserDTO` with optional name, email, and password fields
- `[BE]` Require current password confirmation when changing password
- `[FE]` Build Profile page accessible from the sidebar or header navigation
- `[FE]` Display current profile values pre-filled in editable form fields

## Acceptance Criteria
- [ ] User can update their name and email without changing their password
- [ ] Password change requires the current password to be entered and confirmed
- [ ] Changes are persisted immediately and reflected in the UI after save
- [ ] Validation errors (e.g., email already taken) are shown inline
