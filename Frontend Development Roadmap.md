# **Frontend Development Roadmap**

### Tech Stack: React + Vite + TypeScript

**Goal:** Build a responsive, PWA-enabled web app for customers and businesses.

---

## **Phase 1: Project Setup & Foundation**

**Objectives:** Set up the core environment and ensure scalability.

### ✅ Steps:

1. **Initialize Vite + React + TypeScript Project**
   - Install Vite
   - Configure TypeScript strict mode
   - Setup ESLint + Prettier for code quality
   - Setup basic folder structure:
     ```
     src/
       components/
       pages/
       hooks/
       services/
       types/
     ```
2. **Install Dependencies**
   - UI Framework: **TailwindCSS** (with PostCSS, Autoprefixer)
   - Routing: **React Router**
   - State Management: **Redux Toolkit**
   - HTTP Client: **Axios**
   - Multi Language Support: i18n
3. **PWA Support** // Will be added at the end!
   - Service worker with Vite plugin
   - Manifest.json for add-to-home-screen

---

## **Phase 2: Core Infrastructure**

**Objectives:** Build reusable components and utilities for scalability.

### ✅ Features:

- Create **Design System**
  - Typography, buttons, forms, modals
    - Ended up going with hybrid method - some are my component, for the complex ones I will use open source library
- Create **Global Layout**
  - Header, footer, sidebar (for dashboard)
  - Header (AppBar / Top Navigation)
    - Burger Menu Selector
    - Login
    - search bar
    - Language Switcher (for multi-language support)
    - Theme Toggle
    - Logo and/or App Name
  - Sidebar
    - Collapsible menu for navigation
    - Logged out: search, signup
    - LoggedIn: search, followed businesses, dashboard, logout
  - Footer
    - Minimal links (About, Contact, Terms, Privacy)
  - Utility Layout Components
    - Theme & Direction Provider
      - Handles LTR/RTL and Light/Dark (if needed)
    - Language Switcher
      - open modal pop up
    - Loader / Spinner
    - Error Boundary
- Implement **Theme Support**
  - Light/Dark mode
- **API Integration Layer**
  - Axios instance with interceptors (JWT support)
  - API response typing (using `types`)

---

## **Phase 3: Authentication & User Management**

**Objectives:** Enable user and business authentication.

### ✅ Features:

- Sign-up / Login / Logout (customer & business)
- JWT token handling (secure storage)
- Protected routes (React Router)
- Forgot password flow
- Basic user profile page

---

## **Phase 4: Business Pages**

**Objectives:** Create a dynamic page that serves both customers and the business owner with different capabilities.

### ✅ Features:

- **Public Business Page (for customers)**
  - Displays:
    - Business name, description
    - Services list (with price & duration)
    - Available booking slots
    - Contact info
  - “Book Appointment” button
- **Owner View (for the business owner)**
  - Same layout as public view, **but with an Edit Mode toggle**
  - **Edit Mode Features:**
    - Update business details (name, description, logo, contact info)
    - Add/Edit/Delete services
    - Upload banner/logo images
    - Change theme colors
    - Save & preview changes in real-time
- **Dynamic Routing**
  - URL format: `/business/:businessId`
- **Permissions**
  - Owner identified by JWT token → sees “Edit” button
  - Customers see only public info (read-only)

---

## **Phase 5: Booking Flow**

**Objectives:** Customers can book an appointment.

### ✅ Features:

- **Service Selection**
  - Show services, duration, price
- **Date & Time Picker**
  - Show available slots dynamically
- **Booking Confirmation**
  - Summary + confirm button
- **Booking Success Page**

---

## **Phase 6: Dashboards**

**Objectives:** Separate dashboards for customers and businesses.

### ✅ Business Dashboard:

- Overview (upcoming appointments, total bookings)
- Appointment management (list, cancel, reschedule)
- Edit business details & services

### ✅ Customer Dashboard:

- Upcoming appointments
- Booking history
- Followed businesses list

---

## **Phase 7: Discovery & Search**

**Objectives:** Implement marketplace functionality.

### ✅ Features:

- **Search Bar**
  - Category, location
- **Filters**
  - Availability, rating
- **Business Cards**
  - Name, category, next available slot

---

## **Phase 8: Notifications & PWA Enhancements**

**Objectives:** Engage users with real-time updates.

### ✅ Features:

- Push notifications (via service workers)
- In-app notifications
- Installable PWA on mobile

---

## **Phase 9: Polish & Performance**

**Objectives:** Optimize for speed and user experience.

### ✅ Tasks:

- Lighthouse optimization
- Lazy loading components
- Image optimization (Cloudinary or similar)
- Error boundaries & fallback UI

---

## **Deliverables by Phase**

| Phase | Deliverable                                         |
| ----- | --------------------------------------------------- |
| 1     | Project skeleton with Vite, Tailwind, Router, State |
| 2     | Design system, global layout, API integration       |
| 3     | Authentication & user flow                          |
| 4     | Public business pages                               |
| 5     | Booking flow completed                              |
| 6     | Dashboards (business & customer)                    |
| 7     | Search & discovery                                  |
| 8     | Notifications & PWA features                        |
| 9     | Performance optimization                            |

---
