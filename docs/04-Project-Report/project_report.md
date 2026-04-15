# Personalized Healthcare Dashboard — Project Report

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [User Stories](#2-user-stories)
3. [System Architecture and System Design](#3-system-architecture-and-system-design)
4. [Design of Tests](#4-design-of-tests)
5. [Appendix](#5-appendix)
   - [5a. Software Requirements Specification (SRS)](#5a-software-requirements-specification-srs)
   - [5b. Data Flow Diagrams (DFD)](#5b-data-flow-diagrams-dfd)
   - [5c. Entity Relationship Diagram (ERD)](#5c-entity-relationship-diagram-erd)
   - [5d. UML Diagrams](#5d-uml-diagrams)
   - [5e. Code Listing / GitHub Link](#5e-code-listing--github-link)

---

## 1. Problem Statement

### 1.1 Background

In the modern healthcare landscape, patients generate vast amounts of health data — vital signs, medication schedules, fitness activities, nutrition logs, and sleep patterns. However, this data is often:

- **Fragmented** across multiple applications and devices
- **Inaccessible** when patients need it most (e.g., during doctor visits)
- **Insecure** with many health apps lacking proper encryption and compliance
- **Unactionable** due to the absence of trend analysis and visualization

Healthcare providers and caregivers, on the other hand, lack efficient tools to:
- Monitor patient health data remotely
- Identify concerning health trends before they become emergencies
- Manage healthcare facility information and personnel directories
- Maintain HIPAA-compliant audit trails of data access

### 1.2 Problem Definition

**There is a need for a centralized, secure, and user-friendly platform that enables patients to track, visualize, and manage their personal health data while providing healthcare administrators with tools to oversee patient care, manage healthcare facilities, and maintain regulatory compliance.**

### 1.3 Objectives

1. **Develop a patient-facing dashboard** for tracking vitals, medications, nutrition, fitness, and sleep with interactive visualizations
2. **Build an administrative interface** for managing patients, healthcare facilities, and audit compliance
3. **Implement HIPAA-compliant security** including encryption at rest, MFA, RBAC, and RLS
4. **Enable real-time notifications** for medication reminders, health alerts, and system updates
5. **Support data export** in CSV, JSON, and PDF formats for sharing with healthcare providers
6. **Provide responsive, accessible** design that works across all devices

### 1.4 Scope

| In Scope | Out of Scope |
|----------|-------------|
| Patient health data tracking (6 vital types) | Medical diagnosis or treatment recommendations |
| Medication management with reminders | Electronic Health Record (EHR) integration |
| Admin dashboard with facility management | Insurance claim processing |
| MFA and encryption security | Telemedicine/video consultation |
| Data export (CSV, JSON, PDF) | Wearable device direct sync |
| Nearby healthcare services discovery | Appointment scheduling with providers |

---

## 2. User Stories

### 2.1 Patient User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|-----------|----------|-------------------|
| US-P01 | As a patient, I want to **register an account** with email and password so that I can securely access my health dashboard. | High | Account created, MFA setup prompted, redirected to dashboard |
| US-P02 | As a patient, I want to **log my vital signs** (blood pressure, heart rate, temperature, weight, glucose, SpO₂) so that I can maintain a health record. | High | Form captures metric type, value, unit, and optional notes; data encrypted at rest |
| US-P03 | As a patient, I want to **view health trends over time** with interactive charts so that I can identify patterns in my health data. | High | Line/bar charts with date range filtering, metric type selection |
| US-P04 | As a patient, I want to **manage my medications** (add, edit, delete) with dosage and frequency so that I can track my treatment plan. | High | CRUD operations on medications with active/inactive status |
| US-P05 | As a patient, I want to **track my daily nutrition** (meals, calories, macros) so that I can maintain a healthy diet. | Medium | Log meals by type (breakfast, lunch, dinner, snack) with nutritional data |
| US-P06 | As a patient, I want to **monitor my sleep patterns** (duration, quality, bed/wake times) so that I can improve my sleep habits. | Medium | Record sleep data, view quality scores and trends |
| US-P07 | As a patient, I want to **log my fitness activities** (exercise type, duration, calories burned) so that I can track my physical activity. | Medium | Record workouts with type, duration, intensity |
| US-P08 | As a patient, I want to **discover nearby healthcare services** (hospitals, clinics, pharmacies) so that I can find care when needed. | Low | Display nearby facilities with name, address, contact, distance |
| US-P09 | As a patient, I want to **receive real-time notifications** for medication reminders and health alerts. | Medium | WebSocket-powered in-app notifications |
| US-P10 | As a patient, I want to **export my health data** in multiple formats (CSV, JSON, PDF) so that I can share it with my doctor. | Medium | Download file with selected data range and metrics |
| US-P11 | As a patient, I want to **set and track health goals** (weight target, exercise frequency) so that I can stay motivated. | Medium | Create goals with targets, view progress bars |
| US-P12 | As a patient, I want my data to be **encrypted and accessible only to me** so that my privacy is protected. | High | AES-256 encryption, RLS policies, JWT authentication |

### 2.2 Administrator User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|-----------|----------|-------------------|
| US-A01 | As an admin, I want to **view a dashboard** with system statistics (total patients, active users, health logs count) so that I can monitor system health. | High | Statistics cards with real-time counts |
| US-A02 | As an admin, I want to **manage all patient accounts** (view, deactivate) so that I can oversee user management. | High | Searchable patient list with detailed profiles |
| US-A03 | As an admin, I want to **view patient health data** (with audit logging) so that I can provide oversight when authorized. | High | Read-only access, every access logged in audit trail |
| US-A04 | As an admin, I want to **manage hospital records** (add, edit, delete hospitals) so that I can maintain the facility directory. | Medium | CRUD for hospitals with name, address, specialties, contact |
| US-A05 | As an admin, I want to **manage doctor records** so that I can maintain the provider directory. | Medium | CRUD for doctors with name, specialty, hospital affiliation |
| US-A06 | As an admin, I want to **manage medicine shop records** so that patients can find nearby pharmacies. | Medium | CRUD for pharmacies with location and contact |
| US-A07 | As an admin, I want to **manage nursing home records** so that the directory is complete. | Medium | CRUD for nursing homes |
| US-A08 | As an admin, I want to **view audit logs** with filtering so that I can ensure compliance and investigate incidents. | High | Searchable, filterable audit log with timestamps, actions, IPs |
| US-A09 | As an admin, I want to **explore data** with advanced querying tools so that I can generate reports. | Low | Data explorer with filters, aggregation, and export |
| US-A10 | As an admin, I want to **configure system settings** so that I can manage application parameters. | Low | Settings page with configurable options |

### 2.3 Security User Stories

| ID | User Story | Priority |
|----|-----------|----------|
| US-S01 | As a user, I want **Multi-Factor Authentication** so that my account is protected even if my password is compromised. | High |
| US-S02 | As a user, I want my **health data encrypted at rest** so that database breaches don't expose my PHI. | High |
| US-S03 | As a system, I must maintain **audit logs for 7 years** to comply with HIPAA retention requirements. | High |
| US-S04 | As a user, I want **session timeout** after inactivity so that unauthorized access is prevented. | Medium |

---

## 3. System Architecture and System Design

### 3.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Vue 3 / React 18 SPA]
    end

    subgraph "Presentation Layer"
        C[Nginx Reverse Proxy]
    end

    subgraph "Application Layer"
        D[Express.js REST API]
        E[Socket.io WebSocket Server]
        F[Authentication Service]
        G[Health Data Service]
        H[Admin Service]
    end

    subgraph "Data Layer"
        I[(PostgreSQL 15)]
        J[Row-Level Security]
        K[AES-256 Encryption]
    end

    subgraph "External Services"
        L[Supabase BaaS]
        M[Google Fit API]
    end

    A --> B
    B --> C
    C --> D
    C --> E
    D --> F
    D --> G
    D --> H
    F --> I
    G --> I
    H --> I
    I --> J
    I --> K
    B --> L
    D --> M
```

### 3.2 Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        direction TB
        FC1[AuthScreen]
        FC2[DashboardScreen]
        FC3[LogVitalsScreen]
        FC4[TrendsScreen]
        FC5[MedicationsPage]
        FC6[NutritionPage]
        FC7[SleepPage]
        FC8[FitnessPage]
        FC9[NearbyServicesPage]
        FC10[AdminDashboard]
        FC11[PatientManagement]
        FC12[FacilityManagement]
    end

    subgraph "State Management"
        direction TB
        S1[Auth Store]
        S2[Health Store]
        S3[Medications Store]
        S4[Notifications Store]
        S5[Admin Store]
    end

    subgraph "API Layer"
        direction TB
        API1[Auth Routes]
        API2[Health Routes]
        API3[Admin Routes]
        API4[Notification Routes]
        API5[Integration Routes]
    end

    FC1 --> S1
    FC2 --> S2
    FC5 --> S3
    FC10 --> S5

    S1 --> API1
    S2 --> API2
    S5 --> API3
    S4 --> API4
```

### 3.3 Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Frontend Container"
            FE[Nginx + Vue/React Build]
        end
        subgraph "Backend Container"
            BE[Node.js 18 + Express.js]
        end
        subgraph "Database Container"
            DB[(PostgreSQL 15)]
            VOL[Persistent Volume]
        end
    end

    USER[User Browser] -->|Port 8080| FE
    FE -->|Port 5000| BE
    BE -->|Port 5432| DB
    DB --- VOL

    subgraph "CI/CD"
        GH[GitHub Actions]
        TR[Trivy Scanner]
    end

    GH -->|Build & Test| FE
    GH -->|Build & Test| BE
    GH -->|Scan| TR
```

### 3.4 Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        L1[Layer 1: Transport<br/>TLS 1.3 / HTTPS]
        L2[Layer 2: Application<br/>Helmet, CORS, CSP, HSTS]
        L3[Layer 3: Authentication<br/>JWT + MFA TOTP]
        L4[Layer 4: Authorization<br/>RBAC - Patient, Admin, SuperAdmin]
        L5[Layer 5: Data Access<br/>Row-Level Security Policies]
        L6[Layer 6: Data Storage<br/>AES-256-GCM Encryption at Rest]
        L7[Layer 7: Audit<br/>Immutable Audit Logs - 7yr Retention]
    end

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7
```

---

## 4. Design of Tests

### 4.1 Testing Strategy Overview

The project follows the **Testing Pyramid** approach:

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E["E2E Tests (Playwright)<br/>6 test suites, 21 test cases<br/>Critical user journeys"]
        INT["Integration Tests (Supertest + Jest)<br/>1 suite, 20 test cases<br/>API endpoint validation"]
        UNIT["Unit Tests (Jest + Vitest)<br/>5 suites, 40+ test cases<br/>Services, middleware, stores"]
    end

    E2E --- INT --- UNIT

    style UNIT fill:#4CAF50,color:#fff
    style INT fill:#FF9800,color:#fff
    style E2E fill:#F44336,color:#fff
```

### 4.2 Unit Test Design

| Module | Test File | Test Cases | Key Scenarios |
|--------|-----------|-----------|---------------|
| Auth Service | `auth.service.test.js` | 12 | Registration, login, password hashing, JWT, MFA |
| Admin Service | `admin.service.test.js` | 10 | User listing, stats, audit logging, role management |
| Health Logs Service | `healthLogs.service.test.js` | 8 | CRUD, encryption, user isolation |
| Auth Middleware | `authMiddleware.test.js` | 10 | Token validation, role checks, rate limiting |
| Auth Store (Frontend) | `auth.test.js` | 5 | State management, login/logout, token refresh |

### 4.3 Integration Test Design

| Endpoint | Method | Test Cases |
|----------|--------|-----------|
| `/api/register` | POST | Valid registration, invalid email, weak password, duplicate email |
| `/api/login` | POST | Valid credentials, non-existent user, wrong password, MFA required |
| `/api/setup-mfa` | POST | QR code generation, invalid scope rejection |
| `/api/verify-mfa` | POST | Valid code, invalid code, no token |
| Error handling | ALL | Status codes, error format, security headers, rate limiting |

### 4.4 E2E Test Design

| Workflow | Tests | Key Assertions |
|----------|-------|----------------|
| Authentication | 5 | Login → MFA → Dashboard; Invalid credentials; MFA setup; Protected routes; Logout |
| Patient Dashboard | 3 | Health metrics display; Navigation to sub-pages |
| Medication Management | 5 | Add → Edit → Delete → Search → Filter |
| Profile Management | 3 | Profile display; Password change; MFA status |
| Accessibility | 3 | Keyboard navigation; Heading hierarchy; Form labels |
| Error Handling | 2 | Network failure; API timeouts |

### 4.5 Mutation Testing Design

- **Tool**: Stryker.js
- **Target Modules**: authService, authMiddleware, healthLogService, adminService
- **Mutation Operators**: Arithmetic, Conditional, String, Block, Boolean
- **Quality Threshold**: 80% mutation score (achieved: 80.9%)

### 4.6 Test Coverage Summary

| Component | Lines | Functions | Branches |
|-----------|-------|-----------|----------|
| Backend Services | 75% | 72% | 68% |
| Backend Middleware | 72% | 70% | 65% |
| Frontend Stores | 65% | 63% | 60% |
| **Overall** | **71%** | **68%** | **64%** |

---

## 5. Appendix

---

### 5a. Software Requirements Specification (SRS)

#### 5a.1 Introduction

| Field | Description |
|-------|-------------|
| **Project Title** | Personalized Healthcare Dashboard |
| **Version** | 1.0.0 |
| **Date** | April 2026 |
| **Author** | Sourish Das |
| **Purpose** | Provide a secure, centralized platform for personal health data management |

#### 5a.2 Functional Requirements

| ID | Requirement | Priority | Module |
|----|-------------|----------|--------|
| FR-01 | The system shall allow users to register with email and password | High | Auth |
| FR-02 | The system shall enforce Multi-Factor Authentication (TOTP) | High | Auth |
| FR-03 | The system shall support two roles: Patient and Admin | High | Auth |
| FR-04 | Patients shall be able to log vital signs (6 metric types) | High | Health |
| FR-05 | Patients shall be able to view health data as interactive charts | High | Health |
| FR-06 | Patients shall be able to manage medications (CRUD) | High | Health |
| FR-07 | Patients shall be able to log nutrition with calorie/macro tracking | Medium | Health |
| FR-08 | Patients shall be able to record sleep patterns | Medium | Health |
| FR-09 | Patients shall be able to log fitness activities | Medium | Health |
| FR-10 | Patients shall be able to set and track health goals | Medium | Health |
| FR-11 | Patients shall be able to discover nearby healthcare services | Low | Services |
| FR-12 | Patients shall be able to export data (CSV, JSON, PDF) | Medium | Export |
| FR-13 | Admins shall have a dashboard with system statistics | High | Admin |
| FR-14 | Admins shall be able to view all patient data (with audit logging) | High | Admin |
| FR-15 | Admins shall manage hospitals, doctors, pharmacies, nursing homes | Medium | Admin |
| FR-16 | Admins shall be able to view and filter audit logs | High | Admin |
| FR-17 | The system shall send real-time notifications via WebSocket | Medium | Notification |
| FR-18 | The system shall provide API documentation at `/api/docs` | Low | Documentation |

#### 5a.3 Non-Functional Requirements

| ID | Requirement | Category | Target |
|----|-------------|----------|--------|
| NFR-01 | Page load time under 2 seconds | Performance | < 2s |
| NFR-02 | API response time under 200ms | Performance | < 200ms |
| NFR-03 | Database queries under 100ms | Performance | < 100ms |
| NFR-04 | Support 100+ concurrent users | Scalability | 100+ users |
| NFR-05 | 99.9% uptime availability | Reliability | 99.9% |
| NFR-06 | AES-256-GCM encryption for PHI at rest | Security | HIPAA |
| NFR-07 | TLS 1.3 for all data in transit | Security | Industry standard |
| NFR-08 | Audit log retention for 7 years | Compliance | HIPAA |
| NFR-09 | Rate limiting: 100 req/15min (5 for auth) | Security | DDoS protection |
| NFR-10 | WCAG 2.1 AA accessibility compliance | Usability | Accessibility |
| NFR-11 | Responsive design for mobile, tablet, desktop | Usability | Cross-device |
| NFR-12 | Support Chrome, Firefox, Safari, Edge | Compatibility | Major browsers |

#### 5a.4 System Constraints

| Constraint | Description |
|------------|-------------|
| Database | PostgreSQL 15 (required for RLS and pgcrypto) |
| Runtime | Node.js 18+ |
| Deployment | Docker-compatible environment |
| Authentication | JWT with 1-hour expiration |
| Encryption | AES-256-GCM via pgcrypto extension |
| Compliance | HIPAA security requirements |

#### 5a.5 External Interface Requirements

| Interface | Protocol | Description |
|-----------|----------|-------------|
| Frontend ↔ Backend | REST API (HTTPS) | JSON request/response |
| Frontend ↔ Backend | WebSocket (WSS) | Real-time notifications |
| Backend ↔ Database | PostgreSQL protocol | SQL queries with RLS |
| Frontend ↔ Supabase | REST API (HTTPS) | Real-time database API |
| CI/CD ↔ GitHub | HTTPS | GitHub Actions webhooks |

---

### 5b. Data Flow Diagrams (DFD)

#### 5b.1 DFD Level 0 — Context Diagram

```mermaid
graph LR
    P["Patient"] -->|Health Data, Credentials| SYS["Personalized Healthcare<br/>Dashboard System"]
    SYS -->|Dashboard, Charts,<br/>Notifications, Reports| P

    A["Administrator"] -->|Management Commands,<br/>Queries| SYS
    SYS -->|Admin Dashboard,<br/>Audit Logs, Reports| A

    SYS -->|Queries, Updates| DB[("PostgreSQL<br/>Database")]
    DB -->|Data Results| SYS

    EXT["External Services<br/>(Google Fit, Supabase)"] -->|Health Data,<br/>Auth Tokens| SYS
    SYS -->|API Requests| EXT
```

#### 5b.2 DFD Level 1 — Major Processes

```mermaid
graph TB
    P["Patient"] -->|Credentials| P1["1.0<br/>Authentication<br/>& Authorization"]
    P1 -->|JWT Token| P
    P1 -->|User Session| P2["2.0<br/>Health Data<br/>Management"]
    P1 -->|User Session| P3["3.0<br/>Medication<br/>Management"]
    P1 -->|Admin Session| P4["4.0<br/>Admin<br/>Operations"]
    P1 -->|User Session| P5["5.0<br/>Notification<br/>Service"]

    P -->|Vital Signs, Nutrition,<br/>Sleep, Fitness| P2
    P2 -->|Charts, Trends,<br/>Health Summary| P

    P -->|Medication CRUD| P3
    P3 -->|Medication List,<br/>Reminders| P

    A["Administrator"] -->|Management<br/>Commands| P4
    P4 -->|Statistics,<br/>Audit Logs| A

    P2 -->|Store/Retrieve| DS1[("Health Data<br/>Store")]
    P3 -->|Store/Retrieve| DS2[("Medication<br/>Store")]
    P4 -->|Store/Retrieve| DS3[("Admin Data<br/>Store")]
    P1 -->|Store/Retrieve| DS4[("User<br/>Store")]
    P5 -->|Store/Retrieve| DS5[("Notification<br/>Store")]

    P5 -->|Real-time Alerts| P
    P4 -->|Audit Entry| DS6[("Audit Log<br/>Store")]
```

#### 5b.3 DFD Level 2 — Authentication Process Detail

```mermaid
graph TB
    U["User"] -->|Email, Password| P1_1["1.1<br/>Validate<br/>Credentials"]
    P1_1 -->|Error| U
    P1_1 -->|Valid Credentials| P1_2["1.2<br/>Verify MFA<br/>Code"]

    U -->|TOTP Code| P1_2
    P1_2 -->|Invalid Code| U
    P1_2 -->|MFA Verified| P1_3["1.3<br/>Generate<br/>JWT Token"]

    P1_3 -->|JWT Token| U
    P1_3 -->|Session Info| P1_4["1.4<br/>Check User<br/>Role"]

    P1_4 -->|Patient Role| PDASH["Patient<br/>Dashboard"]
    P1_4 -->|Admin Role| ADASH["Admin<br/>Dashboard"]

    P1_1 -->|Lookup| DS[("Users<br/>Table")]
    P1_2 -->|Verify| DS
    P1_3 -->|Log Login| AL[("Audit<br/>Logs")]
    P1_4 -->|Check Role| UR[("User Roles<br/>Table")]

    NU["New User"] -->|Registration Data| P1_5["1.5<br/>Register<br/>User"]
    P1_5 -->|Hash Password| P1_6["1.6<br/>Setup MFA"]
    P1_5 -->|Store User| DS
    P1_6 -->|QR Code, Secret| NU
    P1_6 -->|Store Secret| DS
```

#### 5b.4 DFD Level 2 — Health Data Management Detail

```mermaid
graph TB
    PT["Patient"] -->|Vital Signs| P2_1["2.1<br/>Log Health<br/>Data"]
    P2_1 -->|Encrypt with AES-256| P2_2["2.2<br/>Encrypt &<br/>Store Data"]
    P2_2 -->|Encrypted Record| HL[("Health Logs<br/>Table")]

    PT -->|Date Range, Metric Type| P2_3["2.3<br/>Retrieve &<br/>Decrypt Data"]
    P2_3 -->|Query with RLS| HL
    HL -->|Encrypted Data| P2_3
    P2_3 -->|Decrypted Values| P2_4["2.4<br/>Generate<br/>Visualizations"]
    P2_4 -->|Charts, Trends| PT

    PT -->|Nutrition Data| P2_5["2.5<br/>Log Nutrition"]
    P2_5 -->|Store| NL[("Nutrition<br/>Logs Table")]

    PT -->|Sleep Data| P2_6["2.6<br/>Log Sleep"]
    P2_6 -->|Store| SL[("Sleep Logs<br/>Table")]

    PT -->|Exercise Data| P2_7["2.7<br/>Log Fitness"]
    P2_7 -->|Store| FL[("Fitness Logs<br/>Table")]

    PT -->|Export Request| P2_8["2.8<br/>Export Data"]
    P2_8 -->|Query All| HL
    P2_8 -->|CSV / JSON / PDF| PT
```

---

### 5c. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        text password_hash
        text mfa_secret
        varchar role
        varchar account_status
        boolean mfa_enabled
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        enum role "patient | admin"
    }

    PROFILES {
        uuid id PK
        uuid user_id FK
        text full_name
        text phone
        date date_of_birth
        text avatar_url
        timestamp created_at
        timestamp updated_at
    }

    HEALTH_LOGS {
        uuid id PK
        uuid user_id FK
        varchar metric "blood_pressure | heart_rate | temperature | weight | glucose | oxygen"
        varchar unit "mmHg | bpm | C | kg | mg/dL | %"
        bytea encrypted_value
        numeric value_numeric
        text notes
        timestamp recorded_at
        timestamp created_at
    }

    MEDICATIONS {
        uuid id PK
        uuid user_id FK
        text name
        text dosage
        text frequency
        date start_date
        date end_date
        boolean is_active
        text notes
        timestamp created_at
    }

    NUTRITION_LOGS {
        uuid id PK
        uuid user_id FK
        text meal_type "breakfast | lunch | dinner | snack"
        text food_items
        numeric calories
        numeric protein
        numeric carbs
        numeric fat
        timestamp recorded_at
    }

    SLEEP_LOGS {
        uuid id PK
        uuid user_id FK
        numeric duration_hours
        integer quality "1-5 scale"
        timestamp bed_time
        timestamp wake_time
        text notes
        timestamp recorded_at
    }

    FITNESS_LOGS {
        uuid id PK
        uuid user_id FK
        text exercise_type
        numeric duration_minutes
        numeric calories_burned
        text intensity "low | medium | high"
        text notes
        timestamp recorded_at
    }

    GOALS {
        uuid id PK
        uuid user_id FK
        text goal_type
        numeric target
        numeric progress
        varchar status "active | completed | abandoned"
        timestamp created_at
    }

    ACTIVITIES {
        uuid id PK
        uuid user_id FK
        text activity_type
        numeric duration
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid admin_id FK
        text action
        uuid target_user_id
        jsonb details
        text ip_address
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        text title
        text message
        text type "alert | reminder | info"
        boolean is_read
        timestamp created_at
    }

    INTEGRATIONS {
        uuid id PK
        uuid user_id FK
        text provider "google_fit | apple_health"
        text oauth_token
        timestamp last_sync_at
    }

    USERS ||--o{ USER_ROLES : "has"
    USERS ||--o| PROFILES : "has"
    USERS ||--o{ HEALTH_LOGS : "logs"
    USERS ||--o{ MEDICATIONS : "takes"
    USERS ||--o{ NUTRITION_LOGS : "records"
    USERS ||--o{ SLEEP_LOGS : "records"
    USERS ||--o{ FITNESS_LOGS : "records"
    USERS ||--o{ GOALS : "sets"
    USERS ||--o{ ACTIVITIES : "performs"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ INTEGRATIONS : "connects"
    USERS ||--o{ AUDIT_LOGS : "generates"
```

---

### 5d. UML Diagrams

#### 5d.1 Use Case Diagram

```mermaid
graph TB
    subgraph "Personalized Healthcare Dashboard"
        UC1["Register Account"]
        UC2["Login with MFA"]
        UC3["Log Vital Signs"]
        UC4["View Health Trends"]
        UC5["Manage Medications"]
        UC6["Track Nutrition"]
        UC7["Record Sleep"]
        UC8["Log Fitness"]
        UC9["Set Health Goals"]
        UC10["Find Nearby Services"]
        UC11["Export Health Data"]
        UC12["Receive Notifications"]

        UC13["View Admin Dashboard"]
        UC14["Manage Patients"]
        UC15["Manage Hospitals"]
        UC16["Manage Doctors"]
        UC17["Manage Pharmacies"]
        UC18["Manage Nursing Homes"]
        UC19["View Audit Logs"]
        UC20["Explore Data"]
        UC21["Configure Settings"]
    end

    Patient["👤 Patient"]
    Admin["👨‍💼 Administrator"]
    System["⚙️ System"]

    Patient --- UC1
    Patient --- UC2
    Patient --- UC3
    Patient --- UC4
    Patient --- UC5
    Patient --- UC6
    Patient --- UC7
    Patient --- UC8
    Patient --- UC9
    Patient --- UC10
    Patient --- UC11
    Patient --- UC12

    Admin --- UC2
    Admin --- UC13
    Admin --- UC14
    Admin --- UC15
    Admin --- UC16
    Admin --- UC17
    Admin --- UC18
    Admin --- UC19
    Admin --- UC20
    Admin --- UC21

    System --- UC12

    UC2 -.->|includes| UC1
    UC3 -.->|extends| UC4
```

#### 5d.2 Class Diagram

```mermaid
classDiagram
    class User {
        -UUID id
        -String email
        -String passwordHash
        -String mfaSecret
        -String role
        -Date createdAt
        +register(email, password)
        +login(email, password)
        +setupMFA()
        +verifyMFA(code)
        +getProfile()
    }

    class HealthLog {
        -UUID id
        -UUID userId
        -String metric
        -String unit
        -Bytes encryptedValue
        -Date recordedAt
        +create(metric, value, unit)
        +getByDateRange(start, end)
        +getByMetric(metric)
        +decrypt(key)
        +delete()
    }

    class Medication {
        -UUID id
        -UUID userId
        -String name
        -String dosage
        -String frequency
        -Date startDate
        -Date endDate
        -Boolean isActive
        +create(name, dosage, frequency)
        +update(fields)
        +deactivate()
        +delete()
    }

    class NutritionLog {
        -UUID id
        -UUID userId
        -String mealType
        -String foodItems
        -Number calories
        -Number protein
        -Number carbs
        -Number fat
        +create(mealType, items, macros)
        +getDaily()
        +getWeekly()
    }

    class SleepLog {
        -UUID id
        -UUID userId
        -Number durationHours
        -Number quality
        -Date bedTime
        -Date wakeTime
        +create(duration, quality, times)
        +getAverage()
        +getTrends()
    }

    class FitnessLog {
        -UUID id
        -UUID userId
        -String exerciseType
        -Number durationMinutes
        -Number caloriesBurned
        -String intensity
        +create(type, duration, calories)
        +getWeeklySummary()
    }

    class AuditLog {
        -UUID id
        -UUID adminId
        -String action
        -UUID targetUserId
        -JSON details
        -String ipAddress
        -Date createdAt
        +create(action, target, details)
        +getByDateRange(start, end)
        +getByAdmin(adminId)
    }

    class AuthService {
        +register(email, password)
        +login(email, password)
        +setupMFA(userId)
        +verifyMFA(userId, code)
        +generateToken(user)
        +hashPassword(password)
        +verifyPassword(hash, password)
    }

    class AdminService {
        +getAllUsers()
        +getUserById(id)
        +getDashboardStats()
        +getAuditLogs(filters)
        +createAuditEntry(action, details)
    }

    class HealthLogService {
        +createLog(userId, data)
        +getLogs(userId, filters)
        +encryptValue(value, key)
        +decryptValue(encrypted, key)
    }

    class AuthMiddleware {
        +authenticate(req, res, next)
        +requireRole(role)
        +rateLimiter(options)
    }

    User "1" --> "*" HealthLog : logs
    User "1" --> "*" Medication : takes
    User "1" --> "*" NutritionLog : records
    User "1" --> "*" SleepLog : records
    User "1" --> "*" FitnessLog : records
    User "1" --> "*" AuditLog : generates

    AuthService --> User : manages
    AdminService --> User : oversees
    AdminService --> AuditLog : creates
    HealthLogService --> HealthLog : manages
    AuthMiddleware --> AuthService : uses
```

#### 5d.3 Sequence Diagram — Patient Login with MFA

```mermaid
sequenceDiagram
    actor P as Patient
    participant FE as Frontend (Vue/React)
    participant API as Express.js API
    participant AUTH as Auth Service
    participant DB as PostgreSQL
    participant MFA as MFA Service

    P->>FE: Enter email & password
    FE->>API: POST /api/login {email, password}
    API->>AUTH: login(email, password)
    AUTH->>DB: SELECT user WHERE email = ?
    DB-->>AUTH: User record (with hashed password)
    AUTH->>AUTH: verifyPassword(inputPassword, hash)
    AUTH-->>API: {requireMfaVerify: true, tempToken}
    API-->>FE: 200 {requireMfaVerify: true, token}
    FE-->>P: Show MFA code input

    P->>FE: Enter 6-digit TOTP code
    FE->>API: POST /api/verify-mfa {code, token}
    API->>MFA: verifyTOTP(userSecret, code)
    MFA-->>API: Valid / Invalid

    alt MFA Valid
        API->>AUTH: generateFullToken(user)
        AUTH-->>API: JWT (full access)
        API->>DB: INSERT audit_log (login_success)
        API-->>FE: 200 {token, role: "patient"}
        FE-->>P: Redirect to Dashboard
    else MFA Invalid
        API-->>FE: 401 {message: "Invalid MFA code"}
        FE-->>P: Show error, retry
    end
```

#### 5d.4 Sequence Diagram — Log Vital Signs

```mermaid
sequenceDiagram
    actor P as Patient
    participant FE as Frontend
    participant API as Express.js API
    participant HLS as Health Log Service
    participant DB as PostgreSQL

    P->>FE: Fill vital signs form (BP: 120/80)
    FE->>FE: Validate input (Zod/Joi)
    FE->>API: POST /api/health {metric, value, unit}
    
    Note over API: JWT verified by AuthMiddleware

    API->>HLS: createLog(userId, data)
    HLS->>HLS: encryptValue(value, AES_KEY)
    HLS->>DB: INSERT INTO health_logs (encrypted_value, ...)
    
    Note over DB: RLS policy checks user_id = auth.uid()

    DB-->>HLS: Success (new record UUID)
    HLS-->>API: {id, metric, recordedAt}
    API-->>FE: 201 Created
    FE-->>P: Show success toast + update chart
```

#### 5d.5 Sequence Diagram — Admin Views Patient Data

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as Admin Dashboard
    participant API as Express.js API
    participant ADMIN as Admin Service
    participant DB as PostgreSQL
    participant AUDIT as Audit Logger

    A->>FE: Click "View Patient Details"
    FE->>API: GET /api/admin/users/:id
    
    Note over API: AdminMiddleware verifies admin role

    API->>ADMIN: getUserById(patientId)
    ADMIN->>DB: SELECT * FROM users WHERE id = ?
    ADMIN->>DB: SELECT * FROM health_logs WHERE user_id = ?
    ADMIN->>DB: SELECT * FROM medications WHERE user_id = ?
    DB-->>ADMIN: Patient data (decrypted)
    
    ADMIN->>AUDIT: createAuditEntry("VIEW_PATIENT", {patientId, adminId, ip})
    AUDIT->>DB: INSERT INTO audit_logs (...)
    
    ADMIN-->>API: {user, healthLogs, medications}
    API-->>FE: 200 {patient data}
    FE-->>A: Display patient profile with health data
```

#### 5d.6 Activity Diagram — Patient Registration Flow

```mermaid
graph TB
    START((Start)) --> A1["Open Registration Page"]
    A1 --> A2["Fill Email & Password"]
    A2 --> A3{"Valid Email<br/>Format?"}
    
    A3 -->|No| A4["Show Email Error"]
    A4 --> A2
    
    A3 -->|Yes| A5{"Password Meets<br/>Policy?"}
    A5 -->|No| A6["Show Password<br/>Requirements"]
    A6 --> A2
    
    A5 -->|Yes| A7["Submit Registration"]
    A7 --> A8{"Email Already<br/>Registered?"}
    
    A8 -->|Yes| A9["Show Duplicate<br/>Email Error"]
    A9 --> A2
    
    A8 -->|No| A10["Create User Account"]
    A10 --> A11["Hash Password<br/>with Argon2"]
    A11 --> A12["Store User in Database"]
    A12 --> A13["Generate MFA Secret"]
    A13 --> A14["Display QR Code<br/>for MFA Setup"]
    A14 --> A15["User Scans QR Code<br/>with Authenticator App"]
    A15 --> A16["Enter Verification Code"]
    A16 --> A17{"Code Valid?"}
    
    A17 -->|No| A18["Show Invalid Code Error"]
    A18 --> A16
    
    A17 -->|Yes| A19["Enable MFA"]
    A19 --> A20["Generate JWT Token"]
    A20 --> A21["Redirect to<br/>Patient Dashboard"]
    A21 --> END((End))
```

#### 5d.7 Activity Diagram — Health Data Logging

```mermaid
graph TB
    START((Start)) --> A1["Navigate to<br/>Log Vitals Page"]
    A1 --> A2["Select Metric Type"]
    A2 --> A3["Enter Value & Unit"]
    A3 --> A4["Add Optional Notes"]
    A4 --> A5{"Input Valid?"}
    
    A5 -->|No| A6["Show Validation Error"]
    A6 --> A3
    
    A5 -->|Yes| A7["Submit Health Log"]
    A7 --> A8["Encrypt Value<br/>with AES-256-GCM"]
    A8 --> A9["Apply RLS Policy<br/>Check user_id"]
    A9 --> A10["Store Encrypted<br/>Record in DB"]
    A10 --> A11["Return Success"]
    A11 --> A12["Update Dashboard<br/>Charts"]
    A12 --> A13["Show Success Toast"]
    A13 --> END((End))
```

#### 5d.8 State Transition Diagram — User Authentication States

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated

    Unauthenticated --> CredentialsSubmitted : Submit login form
    CredentialsSubmitted --> Unauthenticated : Invalid credentials
    CredentialsSubmitted --> MFARequired : Valid credentials

    MFARequired --> MFAVerifying : Submit TOTP code
    MFAVerifying --> MFARequired : Invalid code
    MFAVerifying --> Authenticated : Valid code

    Authenticated --> PatientDashboard : Role = Patient
    Authenticated --> AdminDashboard : Role = Admin

    PatientDashboard --> SessionActive : Navigate pages
    AdminDashboard --> SessionActive : Navigate pages

    SessionActive --> SessionExpired : JWT expires (1hr)
    SessionActive --> Unauthenticated : Logout
    SessionExpired --> Unauthenticated : Redirect to login

    state Unauthenticated {
        [*] --> LoginPage
        LoginPage --> RegisterPage : Click Register
        RegisterPage --> MFASetup : Registration success
        MFASetup --> LoginPage : MFA configured
    }

    state SessionActive {
        [*] --> Active
        Active --> Idle : No activity (15min)
        Idle --> Active : User interaction
        Idle --> TimedOut : Timeout (30min)
    }
```

#### 5d.9 State Transition Diagram — Health Log Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : User fills form

    Draft --> Validating : Submit
    Validating --> Draft : Validation failed
    Validating --> Encrypting : Validation passed

    Encrypting --> Storing : AES-256 encrypted
    Storing --> Stored : RLS check passed
    Storing --> Error : RLS check failed

    Stored --> Displayed : Queried & decrypted
    Displayed --> Stored : Dashboard closed

    Stored --> Exporting : Export requested
    Exporting --> Exported : CSV/JSON/PDF generated
    Exported --> Stored : Export complete

    Stored --> Deleted : Delete requested
    Deleted --> [*] : Permanently removed

    Error --> Draft : Retry
    Error --> [*] : Abandon
```

#### 5d.10 Component Diagram

```mermaid
graph TB
    subgraph "Frontend Package"
        subgraph "UI Components"
            C1[BaseButton]
            C2[BaseCard]
            C3[BaseInput]
            C4[FormField]
            C5[HealthChart]
            C6[LoadingSpinner]
            C7[ToastNotification]
            C8[BottomNav]
        end

        subgraph "View Components"
            V1[AuthScreen]
            V2[DashboardScreen]
            V3[LogVitalsScreen]
            V4[TrendsScreen]
            V5[MedicationsPage]
            V6[NutritionPage]
            V7[AdminDashboard]
            V8[PatientManagement]
        end

        subgraph "State Stores"
            ST1[Auth Store]
            ST2[Health Store]
            ST3[Medications Store]
            ST4[Notifications Store]
            ST5[Admin Store]
        end

        subgraph "Plugins"
            PL1[Vue Router]
            PL2[WebSocket Plugin]
            PL3[Axios HTTP]
        end
    end

    subgraph "Backend Package"
        subgraph "Routes"
            R1[Auth Routes]
            R2[API Routes]
            R3[Admin Routes]
            R4[Notification Routes]
        end

        subgraph "Controllers"
            CT1[Auth Controller]
            CT2[Health Controller]
            CT3[Admin Controller]
            CT4[Profile Controller]
            CT5[Export Controller]
        end

        subgraph "Services"
            SV1[Auth Service]
            SV2[Health Log Service]
            SV3[Admin Service]
            SV4[Reminders Service]
            SV5[Fitness Service]
        end

        subgraph "Middleware"
            MW1[Auth Middleware]
            MW2[Admin Middleware]
            MW3[Rate Limiter]
            MW4[Error Handler]
            MW5[Request Logger]
            MW6[Validation]
        end
    end

    subgraph "Database Package"
        DB1[(Users)]
        DB2[(Health Logs)]
        DB3[(Medications)]
        DB4[(Audit Logs)]
    end

    V1 --> ST1
    V2 --> ST2
    V5 --> ST3
    V7 --> ST5

    ST1 --> PL3
    ST2 --> PL3
    PL3 --> R1
    PL3 --> R2
    PL3 --> R3

    R1 --> MW1 --> CT1
    R2 --> MW1 --> CT2
    R3 --> MW2 --> CT3

    CT1 --> SV1
    CT2 --> SV2
    CT3 --> SV3

    SV1 --> DB1
    SV2 --> DB2
    SV3 --> DB1
    SV3 --> DB4
```

#### 5d.11 Deployment Diagram

```mermaid
graph TB
    subgraph "Developer Machine"
        DEV[VS Code + Git]
    end

    subgraph "GitHub"
        REPO[Repository]
        GHA[GitHub Actions<br/>CI/CD Runner]
    end

    subgraph "Docker Host / Server"
        subgraph "Docker Engine"
            subgraph "Frontend Container"
                NGINX[Nginx Web Server]
                STATIC[Vue/React Static Build]
            end

            subgraph "Backend Container"
                NODE[Node.js 18 Runtime]
                EXPRESS[Express.js Application]
                SOCKET[Socket.io Server]
            end

            subgraph "Database Container"
                PG[PostgreSQL 15]
                PGDATA[Data Volume<br/>Persistent Storage]
            end
        end

        NET[Docker Bridge Network<br/>healthcare-network]
    end

    subgraph "External Services"
        SUPA[Supabase Cloud<br/>Auth + DB + Realtime]
    end

    DEV -->|git push| REPO
    REPO -->|Trigger| GHA
    GHA -->|Build & Deploy| NGINX
    GHA -->|Build & Deploy| NODE

    NGINX -->|:8080 → :80| NET
    NODE -->|:5000| NET
    PG -->|:5432| NET
    PG --- PGDATA

    NET --> NGINX
    NET --> NODE
    NET --> PG

    NGINX -.->|API Proxy| EXPRESS
    EXPRESS -.->|SQL + RLS| PG
    EXPRESS -.->|REST API| SUPA

    style NGINX fill:#4CAF50,color:#fff
    style NODE fill:#FF9800,color:#fff
    style PG fill:#2196F3,color:#fff
```

---

### 5e. Code Listing / GitHub Link

#### GitHub Repositories

| Repository | URL | Description |
|------------|-----|-------------|
| **Healthcare Dashboard** (React + Supabase) | [https://github.com/SourishOP/Healthcare-Dashboard](https://github.com/SourishOP/Healthcare-Dashboard) | Frontend SPA with Supabase backend |
| **Personalized Healthcare Dashboard** (Full-stack) | [https://github.com/SourishOP/personalized-healthcare-dashboard](https://github.com/SourishOP/personalized-healthcare-dashboard) | Complete full-stack application |

#### Project Statistics

| Metric | Healthcare Dashboard | Personalized Healthcare Dashboard |
|--------|---------------------|----------------------------------|
| **Frontend Pages** | 19 (8 patient + 10 admin + 1 common) | 30 (19 patient + 11 admin) |
| **UI Components** | 3 custom + shadcn/ui library | 11 reusable components |
| **State Stores** | AuthContext (React Context) | 13 Pinia stores |
| **Backend Controllers** | — (Supabase handles API) | 10 controllers |
| **Backend Services** | — | 6 services |
| **Middleware** | — | 6 middleware modules |
| **API Routes** | — | 5 route modules (15+ endpoints) |
| **Database Tables** | 8 tables | 9 tables |
| **Test Suites** | 1 (Vitest) | 7 (Jest + Vitest + Playwright) |
| **Total Test Cases** | ~5 | ~80+ |

#### Key Source Files

##### Backend
| File | Purpose | Lines |
|------|---------|-------|
| `server.js` | Express app entry point | ~100 |
| `src/controllers/authController.js` | Authentication request handling | ~60 |
| `src/controllers/adminController.js` | Admin operations | ~200 |
| `src/services/authService.js` | Auth business logic (JWT, Argon2, MFA) | ~85 |
| `src/services/adminService.js` | Admin business logic | ~500 |
| `src/services/healthLogService.js` | Health data CRUD + encryption | ~40 |
| `src/middleware/authMiddleware.js` | JWT validation + role checking | ~40 |
| `src/middleware/adminMiddleware.js` | Admin role enforcement | ~90 |
| `db/init.sql` | Database schema + RLS policies | ~95 |

##### Frontend (Vue 3)
| File | Purpose | Lines |
|------|---------|-------|
| `src/views/DashboardScreen.vue` | Patient dashboard | ~200 |
| `src/views/Login.vue` | Login with MFA | ~400 |
| `src/views/Goals.vue` | Health goal management | ~300 |
| `src/stores/auth.js` | Authentication state | ~85 |
| `src/stores/health.js` | Health data state | ~110 |
| `src/stores/admin.js` | Admin state management | ~300 |
| `src/components/HealthChart.vue` | Chart.js visualization | ~60 |

##### Frontend (React + TypeScript)
| File | Purpose | Lines |
|------|---------|-------|
| `src/App.tsx` | Root routing component | ~107 |
| `src/contexts/AuthContext.tsx` | Auth state management | ~200 |
| `src/pages/patient/PatientDashboard.tsx` | Patient dashboard | ~200 |
| `src/pages/admin/AdminDashboard.tsx` | Admin dashboard | ~180 |
| `src/pages/admin/HospitalsManagementPage.tsx` | Hospital CRUD | ~500 |
| `SQL_CREATE_TABLES.sql` | Complete Supabase schema | ~402 |

---

*Last Updated: April 2026*

*Authors: Sourish Das*

*Project Repository: [github.com/SourishOP](https://github.com/SourishOP)*
