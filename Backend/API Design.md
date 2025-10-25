# 🌐 Business Appointment Platform – API Design

This document defines the REST API endpoints for the Business Appointment Platform.  
Each table describes **method, path, description, input, and output**.

---

## 🔐 Authentication

| Method | Path             | Description                                | Input             | Output                 |
| ------ | ---------------- | ------------------------------------------ | ----------------- | ---------------------- |
| POST   | `/auth/register` | Register a new user (client/owner/worker). | `RegisterUserDTO` | `UserDTO`              |
| POST   | `/auth/login`    | Login user & return JWT.                   | `LoginDTO`        | `{ token: string }`    |
| POST   | `/auth/logout`   | Invalidate JWT (logout).                   | –                 | `{ success: boolean }` |

---

## 👤 Users

| Method | Path          | Description          | Input               | Output    |
| ------ | ------------- | -------------------- | ------------------- | --------- |
| GET    | `/users/{id}` | Get user profile.    | `id: number (path)` | `UserDTO` |
| PUT    | `/users/{id}` | Update user profile. | `UpdateUserDTO`     | `UserDTO` |

---

## 🏢 Businesses

| Method | Path                       | Description                 | Input               | Output              |
| ------ | -------------------------- | --------------------------- | ------------------- | ------------------- |
| POST   | `/businesses`              | Create a new business.      | `CreateBusinessDTO` | `BusinessDTO`       |
| GET    | `/businesses/{id}`         | Get business details.       | `id: number (path)` | `BusinessDTO`       |
| PUT    | `/businesses/{id}`         | Update business info.       | `UpdateBusinessDTO` | `BusinessDTO`       |
| POST   | `/businesses/{id}/workers` | Add a worker to a business. | `AddWorkerDTO`      | `BusinessWorkerDTO` |

---

## 💇 Services

| Method | Path                        | Description                   | Input               | Output         |
| ------ | --------------------------- | ----------------------------- | ------------------- | -------------- |
| POST   | `/businesses/{id}/services` | Add service under a business. | `CreateServiceDTO`  | `ServiceDTO`   |
| GET    | `/businesses/{id}/services` | List services for a business. | `id: number (path)` | `ServiceDTO[]` |
| PUT    | `/services/{id}`            | Update service details.       | `UpdateServiceDTO`  | `ServiceDTO`   |

---

## 🗓 Schedule & Availability (under Business)

| Method | Path                                                       | Description                    | Input                                                                          | Output                     |
| ------ | ---------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------ | -------------------------- |
| POST   | `/businesses/{businessId}/workers/{workerId}/schedule`     | Define worker schedule.        | `CreateScheduleDTO`                                                            | `ScheduleDTO`              |
| GET    | `/businesses/{businessId}/workers/{workerId}/availability` | Get available slots on a date. | `businessId: number (path)`, `workerId: number (path)`, `date: string (query)` | `string[]` (list of times) |

---

## 📅 Appointments

| Method | Path                          | Description                    | Input                      | Output                                    |
| ------ | ----------------------------- | ------------------------------ | -------------------------- | ----------------------------------------- |
| POST   | `/appointments`               | Book an appointment.           | `CreateAppointmentDTO`     | `AppointmentDTO`                          |
| GET    | `/appointments/{id}`          | Get appointment details.       | `id: number (path)`        | `AppointmentDTO`                          |
| GET    | `/appointments?clientId={id}` | Get appointments for a client. | `clientId: number (query)` | `AppointmentDTO[]`                        |
| GET    | `/appointments?workerId={id}` | Get appointments for a worker. | `workerId: number (query)` | `AppointmentDTO[]`                        |
| PUT    | `/appointments/{id}/cancel`   | Cancel appointment.            | `id: number (path)`        | `AppointmentDTO` (with status = canceled) |

---

## 📊 (Optional Future Endpoints)

| Method | Path                     | Description                        | Input               | Output              |
| ------ | ------------------------ | ---------------------------------- | ------------------- | ------------------- |
| GET    | `/reports/business/{id}` | Business reports (revenue, usage). | `id: number (path)` | `ReportDTO`         |
| GET    | `/notifications`         | Get user notifications.            | –                   | `NotificationDTO[]` |
| POST   | `/reviews`               | Add review for service/worker.     | `CreateReviewDTO`   | `ReviewDTO`         |

---

## 📦 DTO Definitions (Draft)

- **RegisterUserDTO**: `{ name: string, email: string, password: string, role: "client" | "owner" | "worker" }`
- **LoginDTO**: `{ email: string, password: string }`
- **UserDTO**: `{ id: number, name: string, email: string, role: string }`
- **UpdateUserDTO**: `{ name?: string, email?: string, password?: string }`

- **CreateBusinessDTO**: `{ name: string, address: string, phone: string }`
- **BusinessDTO**: `{ id: number, name: string, address: string, phone: string, workers: UserDTO[], services: ServiceDTO[] }`
- **UpdateBusinessDTO**: `{ name?: string, address?: string, phone?: string }`
- **AddWorkerDTO**: `{ userId: number, role: "worker" }`
- **BusinessWorkerDTO**: `{ businessId: number, workerId: number }`

- **CreateServiceDTO**: `{ name: string, duration: number, price: number }`
- **UpdateServiceDTO**: `{ name?: string, duration?: number, price?: number }`
- **ServiceDTO**: `{ id: number, name: string, duration: number, price: number }`

- **CreateScheduleDTO**: `{ day: string, shifts: { start: string, end: string }[] }`
- **ScheduleDTO**: `{ workerId: number, day: string, shifts: { start: string, end: string }[] }`

- **CreateAppointmentDTO**: `{ businessId: number, serviceId: number, workerId: number, clientId: number, date: string, time: string }`
- **AppointmentDTO**: `{ id: number, businessId: number, serviceId: number, workerId: number, clientId: number, date: string, time: string, status: "confirmed" | "canceled" }`

- **ReportDTO**: `{ businessId: number, totalAppointments: number, revenue: number, topServices: ServiceDTO[] }`
- **NotificationDTO**: `{ id: number, userId: number, message: string, date: string, read: boolean }`
- **CreateReviewDTO**: `{ serviceId?: number, workerId?: number, rating: number, comment?: string }`
- **ReviewDTO**: `{ id: number, userId: number, serviceId?: number, workerId?: number, rating: number, comment?: string, createdAt: string }`

---
