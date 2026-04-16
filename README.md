# BizSlot

An appointment booking and business discovery platform for small businesses — barbers, nail artists, beauty salons, fitness trainers, and more. Business owners get a customizable public page and a full scheduling system. Customers can discover businesses, book appointments, and manage everything from one place.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Feature Status](#feature-status)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)

---

## What It Does

### For Business Owners
- Sign up and create a business profile with name, description, category, logo, and theme color
- Define services (name, price, duration) and assign them to staff members
- Set weekly working hours and break times per service
- Block dates for holidays, vacations, or special days
- Manage appointments from a dashboard — view, cancel, reschedule
- Invite staff members and manage worker access levels
- Receive notifications for new bookings

### For Customers
- Browse and search businesses by category, keyword, or location
- View any business's public page — services, availability, reviews
- Book an appointment by selecting a service, date, and available time slot
- Follow businesses for quick access
- Manage upcoming and past appointments from a personal dashboard
- Leave reviews after completed appointments

### For Admins
- Manage all users, businesses, categories, and reviews from an admin panel
- Approve or reject category requests
- Flag and moderate reviews
- View platform-wide reports and analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8 Web API (C#) |
| ORM | Entity Framework Core |
| Database | SQL Server Express |
| Frontend | React 19 + Vite + TypeScript |
| State Management | Redux Toolkit |
| HTTP Client | Axios (`withCredentials: true`) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Internationalization | i18next (English + Hebrew, RTL support) |
| Maps | Google Maps JS API + `@googlemaps/markerclusterer` |
| Authentication | JWT issued as HTTP-only cookie |

---

## Architecture Overview

```
Browser (React SPA)
    │
    │  HTTP/JSON  (JWT in HTTP-only cookie)
    ▼
.NET 8 Web API
    │
    ├── Controllers   — handle HTTP requests, validate input, return DTOs
    ├── Services      — business logic
    ├── Repositories  — data access (EF Core)
    ├── Mappers       — Entity ↔ DTO conversion
    └── Models        — EF Core entities
    │
    ▼
SQL Server (BizSlot database)
```

The frontend never talks directly to the database. All state changes flow through the API. JWT is stored server-side as an HTTP-only cookie — it is never accessible from JavaScript.

---

## Database Schema

| Table | Purpose |
|---|---|
| `Users` | All users: id, name, email, passwordHash, role (`BusinessOwner` / `Customer` / `Admin`) |
| `Businesses` | Business profiles: id, ownerId, name, description, categoryId, themeColor, logoUrl |
| `Categories` | Service categories: id, name, iconName |
| `CategoryRequests` | User-submitted requests for new categories |
| `Services` | Services offered by a business: id, businessId, name, price, duration |
| `ServiceSchedules` | Links services to schedules |
| `WeeklyWorkingRules` | Recurring weekly working hours per service |
| `BreakRules` | Break periods within working hours |
| `RecurringRules` | Recurring schedule patterns |
| `AvailabilityRules` | Rule definitions for availability computation |
| `AvailabilitySlots` | Pre-generated available booking slots |
| `DateExceptions` | Blocked dates (holidays, vacations, closed days) |
| `Appointments` | Bookings: id, businessId, customerId, serviceId, dateTime, status |
| `BusinessInvitations` | Invitations for workers to join a business |
| `BusinessPartners` | Worker–business associations with role/permissions |
| `Follows` | Customer–business follow relationships |
| `Reviews` | Customer reviews: rating, comment, appointmentId |
| `Notifications` | In-app notifications for both roles |

---

## API Reference

| Controller | Base Path | Responsibility |
|---|---|---|
| `AuthController` | `/auth` | Register, login, logout, password reset |
| `UserController` | `/users` | Get/update user profile |
| `BusinessController` | `/businesses` | Create, read, update business and its services |
| `CategoryController` | `/categories` | List all categories |
| `SearchController` | `/search` | Search businesses by keyword, category, location |
| `ScheduleController` | `/businesses/{id}/services/{id}/schedule` | Define working hours and breaks |
| `AvailabilityController` | `/businesses/{id}/services/{id}/availability` | Query available booking slots |
| `AppointmentController` | `/appointments` | Book, view, cancel appointments |
| `InvitationController` | `/invitations` | Send and accept staff invitations |
| `PartnerController` | `/partners` | Manage business–worker relationships |
| `FollowController` | `/follows` | Follow/unfollow businesses |
| `ReviewController` | `/reviews` | Submit and view reviews |
| `NotificationController` | `/notifications` | Fetch and mark notifications |
| `ReportsController` | `/reports` | Aggregate stats for dashboard and admin |
| `AdminController` | `/admin` | Admin-only: manage users, businesses, reviews, categories |

Full API schema: see `WebAPI OpenAPI documentation.json` or run the server and visit `http://localhost:5142/scalar/`.

---

## Frontend Routes

| Path | Page | Access |
|---|---|---|
| `/` | `SelectionPage` | Public — role entry point |
| `/business-owner` | `BusinessOwnerLandingPage` | Public |
| `/customer` | `CustomerLandingPage` | Public |
| `/login` | `LoginPage` | Public (redirects if already logged in) |
| `/register` | `RegisterPage` | Public (redirects if already logged in) |
| `/forgot-password` | `ForgotPasswordPage` | Public |
| `/reset-password` | `ResetPasswordPage` | Public |
| `/search` | `SearchPage` | Public — list + map view with filters |
| `/business/:id` | `PublicBusinessPage` | Public — customer view of a business |
| `/book/:businessId/:serviceId` | `BookingPage` | Authenticated Customer |
| `/onboarding` | `OnboardingPage` | Authenticated Owner — 3-step wizard |
| `/dashboard` | `DashboardPage` | Authenticated Owner |
| `/dashboard/schedule/:serviceId` | `ScheduleEditorPage` | Authenticated Owner |
| `/dashboard/services/:serviceId/edit` | `ServiceEditPage` | Authenticated Owner |
| `/dashboard/staff` | `StaffPage` | Authenticated Owner |
| `/dashboard/invitations` | `InvitationsPage` | Authenticated Owner |
| `/dashboard/notifications` | `BusinessNotificationSettingsPage` | Authenticated Owner |
| `/dashboard/reviews` | `BusinessReviewsPage` | Authenticated Owner |
| `/dashboard/customer` | `CustomerDashboardPage` | Authenticated Customer |
| `/staff` | `StaffDashboardPage` | Authenticated Partner/Worker |
| `/admin` | `AdminDashboardPage` | Admin only |
| `/admin/users` | `AdminUsersPage` | Admin only |
| `/admin/businesses` | `AdminBusinessesPage` | Admin only |
| `/admin/appointments` | `AdminAppointmentsPage` | Admin only |
| `/admin/reviews` | `AdminReviewsPage` | Admin only |
| `/admin/reviews/flagged` | `AdminFlaggedReviewsPage` | Admin only |
| `/admin/categories` | `AdminCategoryRequestsPage` | Admin only |
| `/profile` | `ProfilePage` | Authenticated |
| `/privacy` | `PrivacyPolicyPage` | Public |
| `/terms` | `TermsOfServicePage` | Public |

---

## Feature Status

| # | Epic | Status |
|---|---|---|
| 01 | Authentication & User Management | Done |
| 02 | Business Pages & Services | Done |
| 03 | Schedule & Availability | Done |
| 04 | Booking Flow | Done |
| 05 | Search & Discovery | Done |
| 06 | Dashboards | Done |
| 07 | Follow System | Done |
| 08 | Reviews & Ratings | Done |
| 09 | Notifications | Done |
| 10 | Internationalization (i18n) | Done |
| 11 | Sharing & URL Improvements | Not Started |
| 12 | Smart Categories | Done |
| 13 | Progressive Web App (PWA) | Not Started |
| 14 | Admin Panel | In Progress |
| 15 | Home Screen Experience | Not Started |
| 16 | Accessibility | Done |
| 17 | User Onboarding Tutorials | In Progress |
| 18 | Calendar Integration | Not Started |
| 19 | App Shell & Global Layout | Not Started |

Detailed planning for each epic lives in `Planning/` — each folder contains feature files and user story files with tasks tagged `[BE]`, `[FE]`, and `[DB]`.

---

## Running the App

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server Express (`MSI\SQLEXPRESS`, Windows auth)

### Backend
```bash
cd Backend/WebAPI
dotnet run
```
- API base: `http://localhost:5142`
- API docs (Scalar): `http://localhost:5142/scalar/`

### Frontend
```bash
cd front-app
npm install
npm run dev
```
- App: `http://localhost:5173`
- Set `VITE_API_BASE_URL` in `.env` to the API base URL

### Database
The app uses SQL Server with Windows auth. On first run, apply migrations:
```bash
cd Backend/WebAPI
dotnet ef database update
```

---

## Project Structure

```
BizSlot/
├── Backend/
│   └── WebAPI/
│       ├── Controllers/       # HTTP endpoints
│       ├── Models/            # EF Core entities
│       ├── DTOs/              # Request/response shapes
│       ├── Services/          # Business logic
│       ├── Repositories/      # EF Core data access
│       ├── Interfaces/        # Abstractions for DI
│       ├── Mappers/           # Entity ↔ DTO conversion
│       └── Migrations/        # EF Core migrations
├── front-app/
│   └── src/
│       ├── api/               # Axios instance (http.ts)
│       ├── assets/            # Images and static files
│       ├── components/
│       │   ├── UI/            # Design system (Button, Card, Input, Modal…)
│       │   ├── layout/        # AppShell, Header, RoleSidebar
│       │   └── search/        # SearchHeader, BusinessCard, MapView…
│       ├── constants/         # App-wide constants
│       ├── features/          # Redux slices (auth, search, business…)
│       ├── hooks/             # Custom React hooks
│       ├── languages/         # i18n translation files (en, he)
│       ├── pages/             # Route-level page components
│       ├── redux/             # store.ts
│       ├── routes/            # routes.tsx, ProtectedRoute.tsx
│       ├── services/          # API call functions (businessService, etc.)
│       └── types/             # TypeScript type definitions
└── Planning/                  # Epics, features, user stories (Obsidian)
```
