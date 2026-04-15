# Integration Testing — Personalized Healthcare Dashboard

## 1. Overview

Integration testing validates that different modules or services work together correctly. In this project, integration tests verify the interaction between:
- **API endpoints ↔ Database** (PostgreSQL)
- **Frontend components ↔ API services**
- **Authentication flow ↔ MFA system**
- **Docker services ↔ Network communication**

---

## 2. Integration Test Framework

| Component | Tool | Purpose |
|-----------|------|---------|
| HTTP Testing | Supertest | Simulates HTTP requests to Express.js |
| Test Runner | Jest | Manages test lifecycle and assertions |
| Database | PostgreSQL 15 (Docker) | Real database for integration tests |
| E2E Integration | Playwright | Browser-based multi-component tests |

---

## 3. Backend Integration Tests

### 3.1 Authentication API Integration (`backend/__tests__/integration/auth.integration.test.js`)

This suite tests the **complete authentication lifecycle** including registration, login, MFA setup, MFA verification, error handling, security headers, rate limiting, and data validation.

#### Test Cases:

| # | Test Case | Expected Result | Status |
|---|-----------|----------------|--------|
| 1 | `POST /api/register` — Valid registration | 201 Created, JWT token returned, MFA setup required | ✅ Pass |
| 2 | `POST /api/register` — Invalid email format | 400 Bad Request | ✅ Pass |
| 3 | `POST /api/register` — Weak password | 400 Bad Request with password policy message | ✅ Pass |
| 4 | `POST /api/register` — Duplicate email | 409 Conflict | ✅ Pass |
| 5 | `POST /api/login` — Valid credentials | 200 OK, MFA verification required | ✅ Pass |
| 6 | `POST /api/login` — Non-existent email | 401 Unauthorized | ✅ Pass |
| 7 | `POST /api/login` — Wrong password | 401 Unauthorized | ✅ Pass |
| 8 | `POST /api/login` — MFA required | 200 with `requireMfaVerify: true` | ✅ Pass |
| 9 | `POST /api/setup-mfa` — Generate QR code | 200 with secret and QR code | ✅ Pass |
| 10 | `POST /api/setup-mfa` — Invalid scope | 403 Forbidden | ✅ Pass |
| 11 | `POST /api/verify-mfa` — Valid code | 200, full-access token | ✅ Pass |
| 12 | `POST /api/verify-mfa` — Invalid code | 401 Unauthorized | ✅ Pass |
| 13 | `POST /api/verify-mfa` — No token | 401 Unauthorized | ✅ Pass |
| 14 | Error status codes (400-500) | Proper HTTP status hierarchy | ✅ Pass |
| 15 | Error response format | Contains `message` property | ✅ Pass |
| 16 | Security headers | Content-Type, X-Content-Type-Options, X-Frame-Options | ✅ Pass |
| 17 | HTTPS-only cookies | Secure, HttpOnly, SameSite flags | ✅ Pass |
| 18 | Rate limiting on auth endpoints | 429 Too Many Requests | ✅ Pass |
| 19 | Missing required fields | 400 Bad Request | ✅ Pass |
| 20 | Invalid data types | Type validation error | ✅ Pass |

---

### 3.2 E2E Integration Tests (`frontend/e2e/critical-paths.e2e.js`)

These Playwright tests validate **end-to-end user workflows** that integrate frontend, API, and database:

#### Authentication E2E (5 tests)
| Test | Flow |
|------|------|
| Login with MFA | Login → MFA code entry → Dashboard redirect |
| Invalid credentials | Login with wrong password → Error message |
| First-time MFA setup | Register → MFA QR code display |
| Protected route access | Access /dashboard without auth → Redirect to login |
| Logout | Click logout → Redirect to login |

#### Patient Dashboard Workflow (3 tests)
| Test | Flow |
|------|------|
| Dashboard display | Login → Health metrics visible |
| Medications navigation | Dashboard → Click Medications → Medications page |
| Goals navigation | Dashboard → Click Goals → Goals page |

#### Medication Management (5 tests)
| Test | Flow |
|------|------|
| Add medication | Click Add → Fill form (Aspirin, 500mg) → Save → Verify display |
| Edit medication | Find Aspirin → Click Edit → Change dosage → Save → Verify |
| Delete medication | Find Aspirin → Click Delete → Confirm → Verify removed |
| Search medications | Type "Aspirin" → Verify filtered results |
| Filter by status | Select "Active" → Verify filtered |

#### Profile Management (3 tests)
| Test | Flow |
|------|------|
| Profile display | Navigate to /profile → Email and name visible |
| Password change | Current password → New password → Confirm → Success |
| MFA status | MFA/two-factor label visible |

#### Accessibility (3 tests)
| Test | Flow |
|------|------|
| Keyboard navigation | Tab through form → Focus on INPUT/BUTTON elements |
| Heading hierarchy | Single h1 per page |
| Form labels | All inputs have associated labels/aria-labels |

#### Error Handling (2 tests)
| Test | Flow |
|------|------|
| Network failure | Set offline → Submit form → Error message |
| API timeouts | Navigate to /medications → Fallback state rendered |

---

## 4. Docker Integration

The `docker-compose.yml` orchestrates multi-service integration:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────►│   Backend   │────►│  PostgreSQL  │
│  (port 8080)│     │  (port 5000)│     │  (port 5432) │
└─────────────┘     └─────────────┘     └─────────────┘
      nginx              Express            postgres:15
```

- **Health checks** ensure services start in correct order
- **Database initialization** runs `init.sql` on first boot
- **Network isolation** via `healthcare-network` bridge

---

## 5. Screenshots

### 5.1 Integration Test Execution
> *Run `npm test` in the backend directory to see test results.*
> 
> **Screenshot placeholder**: Capture terminal output showing all 20 integration test cases passing.

### 5.2 E2E Test Execution
> *Run `npx playwright test` in the frontend directory.*
>
> **Screenshot placeholder**: Capture Playwright test report showing all critical path test results.

### 5.3 Docker Integration
> *Run `docker-compose up --build` from the root directory.*
>
> **Screenshot placeholder**: Capture Docker Compose output showing all 3 services healthy.

### 5.4 CI/CD Pipeline Integration Tests
> *Push code to GitHub and view Actions tab.*
>
> **Screenshot placeholder**: Capture GitHub Actions workflow showing test-backend and test-frontend jobs.

---

## 6. How to Run Integration Tests

```bash
# Backend integration tests
cd backend
npm install
npm test -- --testPathPattern=integration

# Frontend E2E integration tests
cd frontend
npm install
npx playwright install
npx playwright test

# Full Docker integration test
docker-compose up --build
# Then in another terminal:
curl http://localhost:5000/health    # Backend health check
curl http://localhost:8080           # Frontend accessible
```
