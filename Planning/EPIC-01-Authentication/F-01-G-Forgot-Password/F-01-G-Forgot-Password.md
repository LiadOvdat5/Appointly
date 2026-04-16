# F-01-G: Forgot Password

**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Overview

Let users who registered with email/password reset their password if forgotten.
Flow: user submits email → backend sends a time-limited reset link → user clicks
link → user sets a new password → backend updates hash and invalidates the token.

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-01-G-01-Request-Password-Reset\|US-01-G-01]] | Request a password reset email | ✅ Done |
| [[US-01-G-02-Reset-Password\|US-01-G-02]] | Reset password via emailed link | ✅ Done |

---

## Notes

### Is sending reset emails free?

Yes — several options work for a small app at no cost:

| Provider | Free tier |
|----------|-----------|
| **SendGrid** | 100 emails/day — free forever, no credit card |
| **Resend** | 3 000 emails/month — free forever, simplest .NET SDK |
| **Gmail SMTP** | Unlimited (personal quota) via App Password; easiest for local dev |
| **Mailgun** | 1 000 emails/month free |

**Recommended:** Gmail SMTP for development (no signup needed), Resend or SendGrid for production — both have a generous free tier more than enough for a small app like Appointly.

### Token strategy

Store a `PasswordResetToken` (`nvarchar(512)`, nullable) and `PasswordResetTokenExpiry` (`datetime2`, nullable) on the `Users` row.
Token is a cryptographically random Base64 string; expiry is 1 hour.
No extra table needed at this scale.
