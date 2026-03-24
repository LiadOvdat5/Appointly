# BizSlot – Claude Code Project Guide

## What is this project?
BizSlot is an appointment booking platform for small businesses (barbers, nail artists, trainers, etc.).
Two user roles: **Business Owner** and **Customer**.
Owners create a business page, manage services and schedules.
Customers discover businesses, view their pages, and book appointments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8 Web API (C#), Entity Framework Core, SQL Server |
| Frontend | React 19 + Vite + TypeScript |
| State | Redux Toolkit (`auth` + `search` slices) |
| HTTP | Axios with `withCredentials: true` (JWT via HTTP-only cookie) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| i18n | i18next |
| Maps | Google Maps JS API + `@googlemaps/markerclusterer` |
| Auth | JWT — issued as HTTP-only cookie by the backend |

---

## How to Run

### Backend
```bash
cd Backend/WebAPI
dotnet run
```
- API: `http://localhost:5142`
- API docs (Scalar): `http://localhost:5142/scalar/`
- DB: SQL Server Express — `MSI\SQLEXPRESS`, database `BizSlot`, Windows auth

### Frontend
```bash
cd front-app
npm run dev
```
- App: `http://localhost:5173` (Vite default)
- Reads `VITE_API_BASE_URL` from `.env` for the API base URL

---

## Folder Structure

```
BizSlot/
  Backend/
    WebAPI/
      Controllers/       # API endpoints
      Models/            # EF Core entities
      DTOs/              # Request/response shapes
      Services/          # Business logic
      Repositories/      # Data access
      Interfaces/        # Abstractions
      Mappers/           # Entity ↔ DTO mapping
      Migrations/        # EF Core migrations
  front-app/
    src/
      api/               # Axios instance (http.ts)
      assets/            # Images, static files
      components/
        UI/              # Design system components (Button, Card, Input, etc.)
        layout/          # AppShell, RoleSidebar, Header
        search/          # SearchHeader, SearchListView, SearchMapView, BusinessCard, etc.
      constants/         # App-wide constants
      features/
        search/          # searchSlice.ts, searchSelectors.ts
        business/        # businessSlice.ts
        user/            # userSlice.ts
        appointment/     # appointmentSlice.ts
      hooks/             # useGoogleMaps, useLocationTracking, useMapMarkers, useSearch
      languages/         # i18n translation files
      pages/             # Route-level page components
      redux/             # store.ts, authSlice.ts
      routes/            # routes.tsx, ProtectedRoute.tsx
      services/          # apiClient.ts, businessService.ts, categoryService.ts
      types/             # TypeScript type definitions
  Planning/              # Epics, Features, User Stories (Obsidian-style)
```

---

## Database Schema (SQL Server)

Tables currently in BizSlot DB:
- `Users` — id, name, email, passwordHash, role (BusinessOwner / Customer)
- `Businesses` — id, ownerId, name, description, categoryId, themeColor, logoUrl
- `Categories` — id, name, iconName
- `Services` — id, businessId, name, price, duration
- `ServiceSchedules` — links services to schedules
- `WeeklyWorkingRules` — recurring weekly hours per service
- `AvailabilityRules` — availability rule definitions
- `AvailabilitySlots` — generated available time slots
- `BreakRules` — break times within working hours
- `RecurringRules` — recurring schedule patterns
- `DateExceptions` — blocked dates (holidays, vacations)
- `Appointments` — id, businessId, customerId, serviceId, dateTime, status
- `BusinessInvitations` — invitations for workers to join a business
- `BusinessPartners` — worker-business associations

MCP database connection: `sqlserver://bizslot_mcp:BizSlot1234@MSI:50474/BizSlot?trustServerCertificate=true`

---

## Current Routes (Frontend)

| Path | Component | Notes |
|---|---|---|
| `/` | `SelectionPage` | Role selection (Owner / Customer) |
| `/business-owner` | `BusinessOwnerLandingPage` | Owner landing |
| `/customer` | `CustomerLandingPage` | Customer landing |
| `/login` | `LoginPage` | Redirects to `/` if already logged in |
| `/register` | `RegisterPage` | Redirects to `/` if already logged in |
| `/search` | `SearchPage` | List + map view with category filter |
| `/ui-showcase` | `UIShowcase` | Dev-only component showcase |
| `*` | `NotFoundPage` | 404 |

Missing routes (not yet implemented — see Planning/):
- `/business/:id` — Public business page
- `/dashboard` — Business owner dashboard
- `/dashboard/customer` — Customer dashboard
- `/book/:businessId/:serviceId` — Booking flow

---

## Key Backend Controllers

| Controller | Base Path | Purpose |
|---|---|---|
| `AuthController` | `/auth` | Register, login, logout |
| `UserController` | `/users` | Get/update user profile |
| `BusinessController` | `/businesses` | CRUD business, manage services |
| `CategoryController` | `/categories` | List all categories |
| `SearchController` | `/search` | Search businesses with filters |
| `ScheduleController` | `/businesses/{id}/services/{id}/schedule` | Define working hours |
| `AvailabilityController` | `/businesses/{id}/services/{id}/availability` | Get available slots |
| `AppointmentController` | `/appointments` | Book, view, cancel appointments |
| `InvitationController` | `/invitations` | Worker invitations |

---

## Authentication Flow

- JWT issued as **HTTP-only cookie** on login
- Frontend uses `withCredentials: true` on all Axios requests
- `authBootstrap.tsx` rehydrates session on app load
- `ProtectedRoute` redirects unauthenticated users to `/login`
- Role stored in JWT claims: `BusinessOwner` or `Customer`
- Redux `auth` slice holds: `{ user, isAuthenticated, isLoading }`

---

## Planning

All epics, features, and user stories live in `Planning/` as Obsidian-linked markdown files.

```
Planning/
  README.md               ← Start here — full index with status
  EPIC-01-Authentication/ ✅ Done
  EPIC-02-Business-Pages/ 🔄 In Progress (BE done, FE pending)
  EPIC-03-Schedule-and-Availability/ 🔄 In Progress (BE done, FE pending)
  EPIC-04-Booking-Flow/   🔲 Not Started (BE done, FE stub exists)
  EPIC-05-Search-and-Discovery/ ✅ Done
  EPIC-06-Dashboards/     🔲 Not Started (FE stub exists)
  EPIC-07-Follow-System/  🔲 Not Started
```

Each user story file contains: story, tasks tagged `[BE]`/`[FE]`/`[DB]`, and acceptance criteria.
**Before starting any feature, read the relevant user story files first.**

---

## MCP Tools Available

| MCP | What it does |
|---|---|
| `database` | Query the BizSlot SQL Server DB directly — use to inspect data, verify migrations |
| `browser` | Open and interact with the running app via Playwright |
| `github` | Manage PRs, issues, branches on GitHub (LiadOvdat5) |

---

## Conventions

- **Backend**: Repository pattern — controllers call services, services call repositories. Never put DB logic in controllers.
- **Frontend**: Feature slices in `features/`, server calls in `services/`, reusable UI in `components/UI/`.
- **DTOs**: Always map entities to DTOs before returning from API — never expose raw models.
- **Migrations**: After any model change, run `dotnet ef migrations add <Name>` and `dotnet ef database update`.
- **Commit style**: `type: short description` (e.g. `feat:`, `fix:`, `chore:`)
- **Tags in tasks**: `[BE]` = backend, `[FE]` = frontend, `[DB]` = migration needed

---

## What's Next

The immediate next areas to implement (in order):

1. **EPIC-02 FE** — Public business page (`/business/:id`) + owner edit mode
2. **EPIC-03 FE** — Visual schedule editor UI
3. **EPIC-04 FE** — Full booking flow (`BookingPage.tsx` stub exists)
4. **EPIC-06 FE** — Business + customer dashboards (`DashboardPage.tsx` stub exists)
5. **EPIC-07** — Follow system (BE + FE both needed)
