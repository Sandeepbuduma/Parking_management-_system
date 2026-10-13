# Smart Parking Management System

A modern, full-stack **Smart Parking Management System** built with **React (Vite)**, **Spring Boot 3 (Java 17)**, and **MySQL 8.x**.

Designed for automated slot discovery, live vacancy visualization, vehicle reservation with double-booking prevention, contactless check-in/check-out, automated hourly fee calculation, administrator facility management, and simulated IoT sensor occupancy detection.

---

## 1. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   React 18 Frontend (Vite)                  │
│       Tailwind CSS • Lucide Icons • Recharts • Axios        │
│          Port: 5173 (Dev Proxy -> http://localhost:8080)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON (JWT Auth)
┌──────────────────────────────▼──────────────────────────────┐
│                  Spring Boot 3.3.4 Backend                  │
│   Spring Web • Spring Security • Spring Data JPA • JJWT     │
│             Port: 8080 • Java 17 / OpenJDK                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC (Hibernate DDL Auto)
┌──────────────────────────────▼──────────────────────────────┐
│                     MySQL 8.x Database                      │
│      smart_parking_db on localhost:3306 (root/root)         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Highlights
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, React Router v6, Axios, Recharts, Lucide React.
- **Backend**: Java 17, Spring Boot 3.3.4, Spring Security, BCrypt, JJWT 0.12.5, Jakarta Validation.
- **Database**: MySQL 8.0, Hibernate 6.5.
- **Color Palette**: Dark Navy Blue (`#0f172a`, `#1e293b`), White (`#f8fafc`), Emerald Green (`#10b981`), Ruby Red (`#ef4444`), Amber (`#f59e0b`), Slate Gray (`#64748b`).

---

## 2. Default Demo Login Credentials

The application automatically seeds initial data on first startup without duplicating records.

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@parking.com` | `Admin@123` | Full dashboard, facility & slot management, reservation oversight, customer accounts, sensor simulator, financials |
| **Customer (Driver 1)** | `customer@parking.com` | `Customer@123` | Search spots, reserve slots, register vehicles, check in/out, view live session, billing receipts |
| **Customer (Driver 2)** | `jane@parking.com` | `Customer@123` | Customer reservations and vehicle management |

---

## 3. Database Design (`smart_parking_db`)

The system creates and manages 9 relational tables:

1. **`users`**: User identity, hashed passwords (BCrypt), role (`CUSTOMER`, `ADMIN`), enabled status.
2. **`parking_locations`**: Parking facility name, address, operating hours, floor counts, active status.
3. **`parking_slots`**: Parking bay identifier (unique per location), floor number, vehicle type (`FOUR_WHEELER`, `TWO_WHEELER`, `EV`), hourly rate, status (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`).
4. **`vehicles`**: Customer vehicle license plate (unique), vehicle type, make, model, color, user foreign key.
5. **`reservations`**: Unique booking reference (`SPK-XXXXXXXX`), slot ID, vehicle ID, start & end time, actual check-in & check-out times, status (`PENDING`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`), estimated amount, final billed amount.
6. **`parking_sessions`**: Session duration tracking, check-in time, check-out time, billed hours, hourly rate, total calculated amount, payment status.
7. **`payments`**: Transaction reference (`TXN-XXXXXXXXXX`), paid amount, payment method (`ONLINE`, `CARD`, `UPI`), payment status (`PAID`), timestamp.
8. **`notifications`**: User notifications for booking confirmations, reminders, and payment receipts.
9. **`audit_logs`**: System audit trail recording administrator operations and IoT sensor updates.

---

## 4. Key Business Logic & Billing Rules

### A. Overlap Prevention & Concurrency Protection
To prevent double booking and conflicting reservations:
- When a reservation is requested for a slot between `[startTime, endTime]`, the service executes a query checking for existing reservations where:
  ```sql
  slot_id = :slotId 
  AND status IN ('CONFIRMED', 'ACTIVE', 'PENDING')
  AND start_time < :requestedEndTime 
  AND end_time > :requestedStartTime
  ```
- If an overlapping reservation exists, the API rejects the request with HTTP `409 Conflict`.
- Transactions run with high isolation to guarantee concurrency safety.

### B. Hourly Billing & Rounding Rules
- **Minimum duration**: 1 hour minimum charge for all bookings and sessions.
- **Rounding Rule**: Any partial hour is rounded up to the next full hour (`Math.ceil(minutes / 60.0)`).
- **Check-In**: Starts an active parking session, marks reservation as `ACTIVE`, and marks slot as `OCCUPIED`.
- **Check-Out**: Calculates actual elapsed time in minutes, computes final fee (`hours * hourlyRate`), updates reservation to `COMPLETED`, frees slot to `AVAILABLE`, and records a `PAID` transaction.

### C. Simulated IoT Sensor Telemetry
- Supports ultrasonic or camera-based occupancy detection.
- Includes an interactive **IoT Sensor Simulator** (`/admin/sensor-simulator`) allowing administrators to simulate vehicle arrival (Occupied) and vehicle departure (Vacant).
- Sensor events automatically respect and protect active bookings and are logged to `audit_logs`.

---

## 5. Prerequisites & Environment Setup

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v18 or higher (Node v20+ / v24+ recommended) & npm
- **MySQL**: MySQL 8.x running on `localhost:3306`

### Database Setup
Ensure MySQL is running with username `root` and password `root`:
```sql
CREATE DATABASE IF NOT EXISTS smart_parking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 6. How to Run the Application

### A. Start Spring Boot Backend
Open a terminal in the project root:
```bash
cd backend
./mvnw spring-boot:run
```
*(On Windows Command Prompt or PowerShell, `.\mvnw.cmd spring-boot:run` or `./mvnw spring-boot:run`)*

The backend server starts on **`http://localhost:8080`**.
Health check: **`http://localhost:8080/api/health`**

### B. Start React Frontend
Open a second terminal in the project root:
```bash
cd frontend
npm install
npm run dev
```

The frontend client starts on **`http://localhost:5173`**.

---

## 7. REST API Endpoints Catalog

### Authentication & Profile
- `POST /api/auth/register` - Register a customer account
- `POST /api/auth/login` - Authenticate with email and password (returns JWT)
- `GET /api/auth/me` - Get current authenticated user profile
- `PUT /api/auth/profile` - Update profile name and phone number
- `GET /api/health` - System health and database status

### Locations & Slots (Public & Customer)
- `GET /api/locations` - List active parking facilities with bay statistics
- `GET /api/locations/{id}` - Get facility details
- `GET /api/locations/{id}/slots` - Get all slots for a facility
- `GET /api/slots/available` - Get available slots filtered by location and vehicle type
- `GET /api/slots/{id}` - Get specific slot details
- `GET /api/slots` - Filter slots by floor, status, type, location

### Customer Operations
- `POST /api/reservations` - Reserve an available slot (validates vehicle & overlap)
- `GET /api/reservations/my` - List customer reservations
- `GET /api/reservations/{id}` - View booking voucher
- `PUT /api/reservations/{id}/cancel` - Cancel a confirmed reservation
- `POST /api/vehicles` - Register a vehicle plate
- `GET /api/vehicles/my` - List registered vehicles
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Remove vehicle
- `POST /api/parking-sessions/{reservationId}/check-in` - Record vehicle check-in
- `POST /api/parking-sessions/{reservationId}/check-out` - Record exit & calculate fees
- `GET /api/parking-sessions/active` - List active sessions
- `GET /api/parking-sessions/history` - User parking session history
- `GET /api/payments/my` - User payment history
- `GET /api/notifications/my` - User notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `GET /api/dashboard/customer` - Customer KPI statistics

### Administrator Operations (`ROLE_ADMIN`)
- `GET /api/admin/dashboard/stats` - Admin overview statistics & metrics
- `GET /api/admin/reports/revenue` - 7-day revenue analytics
- `GET /api/admin/reports/occupancy` - Facility occupancy breakdown
- `GET /api/admin/audit-logs` - Audit trail
- `GET /api/admin/locations` - List all locations (including inactive)
- `POST /api/admin/locations` - Create a location
- `PUT /api/admin/locations/{id}` - Update a location
- `DELETE /api/admin/locations/{id}` - Deactivate / delete a location
- `GET /api/admin/slots` - List and filter all slots
- `POST /api/admin/slots` - Create a new parking bay
- `PUT /api/admin/slots/{id}` - Update bay details, rate, or status
- `DELETE /api/admin/slots/{id}` - Remove parking bay
- `GET /api/admin/reservations` - View all reservations across customers
- `PUT /api/admin/reservations/{id}/status` - Override reservation status
- `GET /api/admin/customers` - List all registered customers
- `PUT /api/admin/customers/{id}/toggle-status` - Enable / suspend customer account
- `GET /api/admin/vehicles` - List all vehicles across all users
- `GET /api/admin/parking-sessions/active` - View active sessions
- `GET /api/admin/parking-sessions/all` - View all session history
- `GET /api/admin/payments` - View all payment records
- `POST /api/admin/sensor/simulate` - Inject simulated IoT occupancy sensor event

---

## 8. Verification & Test Suite

The project includes comprehensive test suites covering:
1. **Double-booking prevention**: Overlapping reservation conflict rejection.
2. **Billing calculation**: Rounding rule verification and hourly cost calculations.
3. **Invalid range validation**: Negative or backward time range rejection.
4. **Security & Role-based Access Control**: Authorization enforcement for Admin APIs.
5. **Authentication flow**: JWT issuance on login and user registration.

Execute backend tests:
```bash
cd backend
./mvnw test
```

Execute frontend build verification:
```bash
cd frontend
npm run build
```
Both test suite and production build pass with 0 errors.
