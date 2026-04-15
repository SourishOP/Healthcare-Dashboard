# Tools and Technologies Used — Personalized Healthcare Dashboard

## 1. Overview

The Personalized Healthcare Dashboard is built using modern, industry-standard tools and technologies across the full stack. The technology choices prioritize **security** (HIPAA compliance), **performance**, **developer experience**, and **scalability**.

---

## 2. Frontend Technologies

### 2.1 Primary Frontend (Full-Stack Project)

| Technology | Version | Category | Purpose |
|-----------|---------|----------|---------|
| **Vue.js** | 3.3 | Framework | Progressive JavaScript framework for building reactive UIs |
| **Vite** | 4.4 | Build Tool | Next-generation frontend build tool with instant HMR |
| **Pinia** | 2.1 | State Management | Intuitive, type-safe store for Vue (13 stores) |
| **Vue Router** | 4.2 | Routing | Client-side routing with navigation guards |
| **Axios** | Latest | HTTP Client | Promise-based HTTP client for API communication |
| **Chart.js** | Latest | Visualization | Interactive health data charts and graphs |
| **Socket.io-client** | 4.7 | WebSocket | Real-time notifications and live data updates |
| **CSS3** | — | Styling | Custom responsive design with CSS variables |

### 2.2 Secondary Frontend (React + Supabase Project)

| Technology | Version | Category | Purpose |
|-----------|---------|----------|---------|
| **React** | 18.3 | Framework | Component-based UI library |
| **TypeScript** | 5.8 | Language | Static type checking for JavaScript |
| **Vite** | 5.4 | Build Tool | Fast build tool with TypeScript support |
| **Tailwind CSS** | 3.4 | Styling | Utility-first CSS framework |
| **shadcn/ui** | — | UI Components | Radix UI-based accessible component library |
| **TanStack React Query** | 5.83 | Data Fetching | Server state management and caching |
| **React Hook Form** | 7.61 | Forms | Performant form handling with validation |
| **Zod** | 3.25 | Validation | TypeScript-first schema validation |
| **React Router DOM** | 6.30 | Routing | Declarative routing for React |
| **Recharts** | 2.15 | Charts | Composable charting library for React |
| **Framer Motion** | 12.38 | Animation | Production-ready motion library |
| **Lucide React** | 0.462 | Icons | Beautiful, consistent icon set |
| **Sonner** | 1.7 | Notifications | Toast notification system |
| **next-themes** | 0.3 | Theming | Dark/light mode theme management |

---

## 3. Backend Technologies

| Technology | Version | Category | Purpose |
|-----------|---------|----------|---------|
| **Node.js** | 18+ | Runtime | JavaScript runtime environment |
| **Express.js** | 4.22 | Framework | Minimal, flexible web application framework |
| **PostgreSQL** | 15 | Database | Advanced open-source relational database |
| **JWT** | — | Authentication | JSON Web Tokens for stateless auth |
| **Argon2** | — | Password Hashing | Memory-hard hashing algorithm (winner of PHC) |
| **Socket.io** | 4.7 | WebSocket | Bi-directional real-time event-based communication |
| **Helmet** | — | Security | HTTP security headers middleware |
| **CORS** | — | Security | Cross-Origin Resource Sharing configuration |
| **express-rate-limit** | — | Security | Rate limiting for DDoS protection |
| **Joi** | — | Validation | Object schema validation |
| **Winston** | — | Logging | Versatile logging library |
| **Swagger/OpenAPI** | — | Documentation | API documentation at `/api/docs` |
| **pgcrypto** | — | Encryption | PostgreSQL extension for AES-256-GCM encryption |
| **speakeasy** | — | MFA | TOTP-based Multi-Factor Authentication |
| **Supabase** | 2.103 | BaaS | Backend-as-a-Service (for React project) |

---

## 4. Database Technologies

| Technology | Version | Category | Purpose |
|-----------|---------|----------|---------|
| **PostgreSQL** | 15 | RDBMS | Primary data store |
| **Row-Level Security (RLS)** | — | Security | Database-level data isolation |
| **pgcrypto** | — | Extension | Field-level encryption at rest |
| **uuid-ossp** | — | Extension | UUID generation for primary keys |
| **Supabase** | — | Cloud DB | Managed PostgreSQL with REST API (React project) |
| **Supabase Auth** | — | Auth Service | Managed authentication service |
| **Supabase Realtime** | — | Real-time | Database change notifications |

### Database Tables

| Table | Purpose | Security |
|-------|---------|----------|
| `users` | User accounts and credentials | RLS + Password hashing |
| `health_logs` | Vital signs and health metrics | RLS + AES-256 encryption |
| `medications` | Medication tracking | RLS |
| `goals` | Health goals and progress | RLS |
| `activities` | Physical activity logs | RLS |
| `nutrition_logs` | Nutritional intake data | RLS |
| `sleep_logs` | Sleep pattern tracking | RLS |
| `fitness_logs` | Exercise and workout data | RLS |
| `audit_logs` | System activity audit trail | Admin-only access |
| `notifications` | User notification queue | RLS |
| `integrations` | Third-party service connections | RLS + Token encryption |
| `user_roles` | Role-Based Access Control | RLS |
| `profiles` | User profile information | RLS |

---

## 5. DevOps & Infrastructure

| Technology | Version | Category | Purpose |
|-----------|---------|----------|---------|
| **Docker** | Latest | Containerization | Application containerization |
| **Docker Compose** | v2 | Orchestration | Multi-container service orchestration |
| **Nginx** | Alpine | Web Server | Static file serving and reverse proxy |
| **GitHub Actions** | — | CI/CD | Automated testing, building, and deployment |
| **Trivy** | — | Security | Container and filesystem vulnerability scanning |
| **Codecov** | — | Coverage | Code coverage reporting and tracking |

---

## 6. Testing Tools

| Technology | Version | Category | Purpose |
|-----------|---------|----------|---------|
| **Jest** | Latest | Unit/Integration | Backend JavaScript testing framework |
| **Vitest** | 3.2 | Unit Testing | Fast Vite-native test framework |
| **Playwright** | Latest | E2E Testing | Cross-browser end-to-end testing |
| **Supertest** | Latest | API Testing | HTTP assertion library for Express |
| **@testing-library/react** | 16.0 | Component Testing | React component testing utilities |
| **jsdom** | 20.0 | DOM Simulation | Browser-like DOM for Node.js tests |
| **Stryker.js** | Latest | Mutation Testing | Test quality analysis via mutation |
| **Istanbul/nyc** | — | Coverage | Code coverage instrumentation |

---

## 7. Development Tools

| Technology | Version | Category | Purpose |
|-----------|---------|----------|---------|
| **VS Code** | Latest | IDE | Primary code editor |
| **Git** | Latest | Version Control | Distributed version control system |
| **GitHub** | — | Code Hosting | Repository hosting and collaboration |
| **Bun** | Latest | Package Manager | Fast JavaScript runtime and package manager |
| **npm** | Latest | Package Manager | Default Node.js package manager |
| **ESLint** | 9.32 | Linting | JavaScript/TypeScript code quality |
| **Prettier** | — | Formatting | Code formatting |
| **TypeScript** | 5.8 | Type Checking | Static type analysis |
| **PostCSS** | 8.5 | CSS Processing | CSS transformation pipeline |
| **Autoprefixer** | 10.4 | CSS | Automatic vendor prefix addition |
| **nodemon** | — | Dev Server | Auto-restart on file changes |
| **Postman/Insomnia** | — | API Testing | Manual API endpoint testing |

---

## 8. Security Technologies

| Technology | Purpose | Standard |
|-----------|---------|----------|
| **JWT (JSON Web Tokens)** | Stateless authentication | RFC 7519 |
| **Argon2id** | Password hashing | Winner of Password Hashing Competition |
| **AES-256-GCM** | Data encryption at rest | NIST-approved symmetric encryption |
| **TLS 1.3** | Transport encryption | IETF standard |
| **TOTP (RFC 6238)** | Multi-Factor Authentication | Time-based One-Time Password |
| **Helmet.js** | HTTP security headers | OWASP recommendations |
| **CORS** | Cross-origin protection | W3C specification |
| **Rate Limiting** | DDoS protection | OWASP best practice |
| **Row-Level Security** | Database isolation | PostgreSQL native feature |
| **CSP** | Content Security Policy | W3C header |
| **HSTS** | HTTP Strict Transport Security | RFC 6797 |

---

## 9. Architecture Diagram (Technologies)

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  Vue 3 / React 18 │ Tailwind CSS │ Chart.js / Recharts          │
│  Pinia / React Query │ Vue Router / React Router                │
│  Socket.io-client │ Axios                                       │
└──────────────────────┬────────────────────────────────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────▼────────────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                        │
│                    Docker Container                                │
└──────────────────────┬────────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────────┐
│                    EXPRESS.js API SERVER                           │
│  Helmet │ CORS │ Rate Limiter │ JWT Auth │ Joi Validation        │
│  Winston Logger │ Swagger Docs │ Socket.io                       │
│                    Docker Container (Node 18)                     │
└──────────────────────┬────────────────────────────────────────────┘
                       │ SQL + RLS
┌──────────────────────▼────────────────────────────────────────────┐
│                    POSTGRESQL 15                                   │
│  RLS Policies │ pgcrypto (AES-256) │ uuid-ossp                   │
│  Audit Logs │ Indexes │ Triggers                                 │
│                    Docker Container                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Technology Selection Rationale

| Choice | Reason |
|--------|--------|
| **Vue 3 / React 18** | Modern reactive frameworks with large ecosystems |
| **Express.js** | Lightweight, flexible, well-documented Node.js framework |
| **PostgreSQL 15** | Robust RDBMS with RLS, encryption extensions, JSON support |
| **Docker** | Reproducible environments, easy deployment |
| **JWT + Argon2** | Industry-standard secure authentication |
| **AES-256-GCM** | HIPAA-compliant encryption for PHI data |
| **Socket.io** | Reliable real-time communication with fallback |
| **GitHub Actions** | Integrated CI/CD with the code repository |
| **Vite** | 10-100x faster than webpack, instant HMR |
| **TypeScript** | Catches bugs at compile time, improves maintainability |
