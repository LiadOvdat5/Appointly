# 📋 Product Requirements Document (PRD) - Appointment Booking & Business Pages App

## **1. Overview**

A platform for small businesses (e.g., barbers, nail artists, trainers) to manage appointments easily and share a personalized business page with clients. Customers can book appointments, follow businesses, and discover new ones.

### **Main Goals**

- Allow businesses to sign up, create a business account, and customize their business page.
- Provide customers the ability to:
  - View public business pages
  - Book appointments
  - Search and follow businesses
- Build an ecosystem for businesses and customers to interact efficiently.

---

## **2. Target Users**

- **Business Owners:** Small business owners who need a simple solution to manage appointments and present their services.
- **Customers:** People who want to book appointments easily and discover businesses.

---

## **3. User Roles**

- **Business Owner:**
  - Create and manage business page
  - Configure services and availability
  - Edit and style their page
  - View appointments
- **Customer:**
  - View business pages (public view)
  - Book appointments
  - Follow businesses
  - Search for businesses by category, location, availability

---

## **4. Core Features**

### **4.1 Authentication & Profiles**

- **Business Owners**
  - Sign up / Login
  - Business Profile creation
- **Customers**
  - Sign up / Login
  - Manage personal profile
  - Follow businesses

---

### **4.2 Business Pages**

**Dynamic behavior based on user type:**

- **Public View (for Customers):**
  - Displays:
    - Business name, description
    - Services (name, price, duration)
    - Available booking slots
    - Contact info
    - Gallery (optional future feature)
  - **Book Appointment** button
- **Owner View:**
  - Same page layout as customers
  - **Edit Mode Toggle**:
    - Update business details (name, description, logo, contact info)
    - Add/Edit/Delete services
    - Upload banner/logo
    - Change theme colors
    - Preview changes in real-time
- **Routing:** `/business/:businessId`
- **Permissions:**
  - Owner identified via JWT token → sees “Edit” button
  - Customers → read-only view

---

### **4.3 Appointment Booking**

- **For Customers:**
  - View calendar with available slots
  - Select service → choose time → confirm booking
- **For Businesses:**
  - Define working hours
  - Manage availability
  - Approve/cancel appointments (future feature)
- **Notifications:**
  - Email or push notifications (future feature)

---

### **4.4 Search & Discovery**

- **Customers can:**
  - Search businesses by:
    - Category
    - Location
    - Availability
  - Filter and sort
- **Add to “Followed Businesses”**

---

## **5. Non-Functional Requirements**

- **Performance:** Pages load under 2 seconds.
- **Scalability:** Should handle multiple businesses and customers simultaneously.
- **Security:** JWT authentication, encrypted data storage.
- **Responsive:** Works on mobile and desktop.

---

## **6. Tech Stack**

- **Frontend:** React + Vite + TypeScript, TailwindCSS
- **Backend:** .NET 8 Web API (C#), Entity Framework Core, SQL Server
- **Auth:** JWT
- **Hosting:** Azure or AWS (future)
- **Optional:** Image upload via AWS S3 or Azure Blob

---

## **7. Future Enhancements**

- Push notifications for appointments
- Integrated payment system
- Multi-language support (Hebrew, English)
- AI-based recommendation for businesses

---

## **8. User Flow Overview**

1. **Business Owner Flow:**
   - Sign up → Create business → Edit business page → Share link
2. **Customer Flow:**
   - Browse/search business → View page → Book appointment → Add to “Followed Businesses”

---

## **9. Page List**

- **Public Pages:**
  - Home / Landing
  - Search & Discover
  - Business Page (Customer View)
- **Customer Pages:**
  - Dashboard (Followed Businesses, Upcoming Appointments)
- **Business Owner Pages:**
  - Dashboard (Manage business, appointments)
  - Business Page (Editable view)
  - Settings (Account, availability)

---

## **10. Key Components**

- **Navigation Bar**
- **Search Bar**
- **Business Card**
- **Appointment Calendar**
- **Service List**
- **Edit Mode Toolbar (for owners)**

---

## **11. Success Metrics**

- Number of businesses onboarded
- Number of appointments booked
- Engagement (searches, follows, bookings)
