# **Backend Development Roadmap**

### Tech Stack: .NET 8 Web API (C#), Entity Framework Core, SQL Server

**Goal:** Build a robust, scalable, and secure backend to support the Appointment Booking & Business Pages App.

---

## **Phase 1: Project Setup**

- Initialize .NET Web API project
- Configure project structure:
  ````
  Controllers/
  Models/
  DTOs/
  Services/
  Repositories/
  Interfaces/
  Data/
  Mappers/
   ```
  ````
- Add Entity Framework Core and configure `DbContext`
- Setup SQL Server and connection string
- Implement migrations for database schema

---

## **Phase 2: Authentication & User Management**

- **Models:**
- `User` (Id, Name, Email, Role)
- **Roles:** `BusinessOwner`, `Customer`
- Implement JWT authentication:
- Register
- Login
- Role-based authorization
- Hash passwords
- Middleware for JWT validation

---

## **Phase 3: Business Management**

- **Models:**
- `Business` (Id, Name, Description, ContactInfo, OwnerId, ThemeColor, LogoUrl)
- `Service` (Id, BusinessId, Name, Price, Duration)
- **Endpoints:**
- `POST /business` → Create business (BusinessOwner only)
- `GET /business/:id` → Get business details
- `PUT /business/:id` → Update business (owner only)
- `DELETE /business/:id` → Delete business
- **Service Management:**
- `POST /business/:id/services`
- `PUT /services/:id`
- `DELETE /services/:id`

---

## **Phase 4: Appointment Booking System**

- **Models:**
- `Appointment` (Id, BusinessId, CustomerId, ServiceId, DateTime, Status)
- **Endpoints:**
- `POST /appointments` → Create appointment
- `GET /appointments/business/:id` → Business appointments
- `GET /appointments/user/:id` → Customer appointments
- `PUT /appointments/:id/cancel` → Cancel appointment
- **Availability Management:**
- Store business working hours
- Check availability before booking

---

## **Phase 5: Search & Discovery**

- **Endpoints:**
- `GET /businesses?category=&location=&availability=` → Search businesses with filters
- `GET /businesses/top` → Recommended businesses (future AI feature)

---

## **Phase 6: Follow System**

- **Models:**
- `Follow` (Id, UserId, BusinessId)
- **Endpoints:**
- `POST /follow` → Follow a business
- `DELETE /follow/:id` → Unfollow a business
- `GET /follow/user/:id` → Get followed businesses

---

## **Phase 7: Role-Based Permissions & Security**

- Middleware for role checks:
- BusinessOwner → Can edit their business only
- Customer → Can book appointments
- Validate ownership before updates
- Prevent unauthorized access

---

## **Phase 8: File Upload (Optional Future Feature)**

- Upload business logos/banners
- Use Azure Blob Storage or AWS S3
- Endpoint: `POST /business/:id/upload-logo`

---

## **Phase 9: Notifications (Future Feature)**

- Email or push notifications for:
- Appointment confirmations
- Appointment reminders
- Integrate with SendGrid or Firebase

---

## **Database Schema Overview**

- **Users**: `Id`, `Name`, `Email`, `PasswordHash`, `Role`
- **Businesses**: `Id`, `OwnerId (FK Users)`, `Name`, `Description`, `ThemeColor`, `LogoUrl`
- **Services**: `Id`, `BusinessId`, `Name`, `Price`, `Duration`
- **Appointments**: `Id`, `BusinessId`, `CustomerId`, `ServiceId`, `DateTime`, `Status`
- **Follows**: `Id`, `UserId`, `BusinessId`

---

## **Deployment Steps**

- Configure Docker (optional)
- Setup CI/CD pipeline (Azure DevOps or GitHub Actions)
- Deploy to Azure App Service or AWS Elastic Beanstalk

---
