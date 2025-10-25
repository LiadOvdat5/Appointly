# 📘 Business Appointment Platform – Data Schema

This document defines the core database schema for the Business Appointment Platform.

---

## 🧑 User

Represents every registered user in the system.  
Every user starts as a **client**.  
If they also manage or work in businesses, they get a linked **BusinessPartner** record.

| Field      | Type                         | Notes                                 |
| ---------- | ---------------------------- | ------------------------------------- |
| id         | UUID                         | Primary Key                           |
| name       | STRING                       | Full name                             |
| email      | STRING                       | Unique, required                      |
| password   | STRING (hash)                | Required                              |
| phone      | STRING                       | Optional                              |
| role       | ENUM(client, partner, owner) | Current main role (client by default) |
| created_at | DATETIME                     |                                       |
| updated_at | DATETIME                     |                                       |

---

## 🤝 BusinessPartner

Extends a user with fields relevant when they are a partner or owner in one or more businesses.

| Field      | Type        | Notes                                              |
| ---------- | ----------- | -------------------------------------------------- |
| id         | UUID        | Primary Key                                        |
| user_id    | UUID → User | Links to base user                                 |
| businesses | ARRAY(UUID) | Businesses this partner owns or is associated with |
| services   | ARRAY(UUID) | Services this partner provides                     |
| schedules  | ARRAY(UUID) | References availability rules or direct schedules  |
| created_at | DATETIME    |                                                    |
| updated_at | DATETIME    |                                                    |

---

## 🏢 Business

Represents a business created by an owner.  
Has an owner and optionally multiple partners.

| Field       | Type        | Notes                             |
| ----------- | ----------- | --------------------------------- |
| id          | UUID        | Primary Key                       |
| owner_id    | UUID → User | Business owner                    |
| partner_ids | ARRAY(UUID) | BusinessPartner IDs               |
| service_ids | ARRAY(UUID) | Services offered by this business |
| name        | STRING      | Business name                     |
| description | TEXT        | Optional                          |
| address     | STRING      | Optional                          |
| created_at  | DATETIME    |                                   |
| updated_at  | DATETIME    |                                   |

---

## 💼 Service

Defines the services a business offers.  
Each service defines its **own duration** (slot size) and is performed by a specific partner.

| Field       | Type                   | Notes                                 |
| ----------- | ---------------------- | ------------------------------------- |
| id          | UUID                   | Primary Key                           |
| business_id | UUID → Business        |                                       |
| partner_id  | UUID → BusinessPartner | The worker performing the service     |
| name        | STRING                 | Service name                          |
| description | TEXT                   | Optional                              |
| duration    | INT (minutes)          | Duration of the service (slot length) |
| price       | DECIMAL                | Optional                              |
| created_at  | DATETIME               |                                       |
| updated_at  | DATETIME               |                                       |

---

## 📅 AvailabilityRule

Rules defined by a business or partner to generate availability slots.

| Field        | Type                              | Notes                                 |
| ------------ | --------------------------------- | ------------------------------------- |
| id           | UUID                              | Primary Key                           |
| business_id  | UUID → Business                   |                                       |
| partner_id   | UUID → BusinessPartner (nullable) | If rule applies to a specific partner |
| from_date    | DATE                              | Start date                            |
| to_date      | DATE                              | End date                              |
| start_time   | TIME                              | Daily start                           |
| end_time     | TIME                              | Daily end                             |
| days_of_week | ARRAY/INT                         | 0–6 (Sun–Sat) or bitmask              |
| repeat_type  | ENUM(none, weekly, monthly)       | Optional                              |
| created_at   | DATETIME                          |                                       |

---

## 🕒 AvailabilitySlot

Represents a concrete availability block created from rules.  
Clients can book these slots.

| Field       | Type                              | Notes                  |
| ----------- | --------------------------------- | ---------------------- |
| id          | UUID                              | Primary Key            |
| business_id | UUID → Business                   |                        |
| partner_id  | UUID → BusinessPartner (nullable) | If linked to a partner |
| start_time  | DATETIME                          | Slot start             |
| end_time    | DATETIME                          | Slot end               |
| status      | ENUM(open, booked, blocked)       | Default = open         |
| created_at  | DATETIME                          |                        |

---

## 📖 Appointment

Represents a client’s booking with a business.

| Field       | Type                                 | Notes                            |
| ----------- | ------------------------------------ | -------------------------------- |
| id          | UUID                                 | Primary Key                      |
| client_id   | UUID → User                          | The user who booked              |
| service_id  | UUID → Service                       | Service booked                   |
| business_id | UUID → Business                      | Redundant but useful for queries |
| partner_id  | UUID → BusinessPartner               | Who performs the service         |
| status      | ENUM(scheduled, canceled, completed) |                                  |
| created_at  | DATETIME                             |                                  |
| updated_at  | DATETIME                             |                                  |

---

## 📌 AppointmentSlot (Join Table)

Links appointments to one or more slots.  
Needed when service duration spans multiple slots.

| Field          | Type                    | Notes       |
| -------------- | ----------------------- | ----------- |
| id             | UUID                    | Primary Key |
| appointment_id | UUID → Appointment      |             |
| slot_id        | UUID → AvailabilitySlot |             |

---

# 🔗 Relationships Summary

- **User**

  - Base entity for everyone.
  - Can book appointments.
  - Upgraded to **BusinessPartner** if they manage/perform services.

- **BusinessPartner**

  - Extends `User`.
  - Associated with businesses and services.
  - Manages schedules and availability.

- **Business**

  - Has an `owner_id` (User).
  - Has `partner_ids` (BusinessPartners).
  - Has `service_ids` (Services it offers).

- **Service**

  - Belongs to a business.
  - Performed by a `partner_id` (BusinessPartner).
  - Defines its own duration (slot size).

- **AvailabilityRule → AvailabilitySlot**

  - Rules generate concrete slots for booking.

- **Appointment**
  - Belongs to a client (User).
  - Performed by a partner (BusinessPartner).
  - Locks one or more slots (via AppointmentSlot).
  - Tied to a service and business.
