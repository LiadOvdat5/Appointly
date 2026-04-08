# US-01-E-01: Choose Role During Registration

**Feature:** [[F-01-E-Registration-Page|F-01-E: Sign-Up Page — Role Selection & Post-Registration Flow]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **new user**, I want to **choose whether I'm a Customer or a Business Owner during sign-up**, so that **my account starts with the right role and I'm taken to the right place immediately**.

## Tasks

### Backend
- `[BE]` Add optional `Role` field (enum: `client` | `owner`) to `RegisterUserDTO.cs`
- `[BE]` Update `UserMapper.ToUser()` to use the provided role instead of always defaulting to `client`
- `[BE]` Keep the default as `client` when no role is supplied (backwards-compatible)

### Frontend
- `[FE]` Add a role-selection step or toggle to `RegisterPage.tsx` (e.g., two cards: "I'm a Customer" / "I'm a Business Owner")
- `[FE]` Add `role` to the `RegisterRequest` type in `api/auth.ts`
- `[FE]` Pass the selected role in the `register()` call

## Acceptance Criteria
- [ ] A user who picks "Customer" is registered with `role = client`
- [ ] A user who picks "Business Owner" is registered with `role = owner`
- [ ] Omitting a role (e.g., via direct API call) still defaults to `client`
- [ ] The role-selection UI is clear and accessible
