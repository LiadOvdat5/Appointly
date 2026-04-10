# US-01-G-02: Reset Password via Emailed Link

**Feature:** [[F-01-G-Forgot-Password|F-01-G: Forgot Password]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **user who received a password reset email**, I want to **set a new password via the link** so that **I can log in again with a password I know**.

## Tasks

### Backend
- `[BE]` Add `POST /auth/reset-password` endpoint — accepts `{ token: string, newPassword: string }`
  - Hash the incoming token, look up user by the stored hash
  - Reject if token not found or `PasswordResetTokenExpiry` is in the past (return 400)
  - Hash the new password with bcrypt and save; clear `PasswordResetToken` and `PasswordResetTokenExpiry`
- `[BE]` Validate `newPassword` minimum length / complexity server-side (≥ 8 chars)

### Frontend
- `[FE]` Create `ResetPasswordPage` — reads `token` from query string, shows new password + confirm password fields
- `[FE]` Add route `/reset-password` → `ResetPasswordPage` in `routes.tsx`
- `[FE]` On success show "Password updated — you can now log in" and redirect to `/login` after 2 s
- `[FE]` On token-expired/invalid error show "This link has expired or is invalid. Please request a new one." with a link back to `/forgot-password`
- `[FE]` Client-side validation: passwords match, minimum length

## Acceptance Criteria
- [ ] Valid token + new password updates the user's password and clears the reset token
- [ ] Using an expired or already-used token returns a clear error
- [ ] User is redirected to login after a successful reset
- [ ] Google-registered users (no `passwordHash`) who land on this page see a message explaining they signed up with Google and should use that to log in
