# Testing Overview — Personalized Healthcare Dashboard

## 1. Testing Strategy

The Personalized Healthcare Dashboard employs a comprehensive, multi-layered testing strategy following the **Testing Pyramid** approach to ensure software reliability, security, and compliance with healthcare data standards.

```
            ┌────────────┐
            │   E2E /    │  ← Playwright (critical user journeys)
            │  UI Tests  │
            ├────────────┤
            │ Integration│  ← Supertest + Jest (API integration)
            │   Tests    │
            ├────────────┤
            │   Unit     │  ← Vitest / Jest (services, middleware, stores)
            │   Tests    │
            └────────────┘
```

---

## 2. Testing Frameworks & Tools

| Layer | Framework | Language | Runner |
|-------|-----------|----------|--------|
| **Unit Tests (Backend)** | Jest | JavaScript | `npm run test` |
| **Unit Tests (Frontend)** | Vitest | JavaScript / Vue | `npm run test` |
| **Integration Tests** | Jest + Supertest | JavaScript | `npm run test` |
| **E2E Tests** | Playwright | JavaScript | `npx playwright test` |
| **Mutation Testing** | Stryker.js | JavaScript | `npx stryker run` |
| **Regression Testing** | GitHub Actions CI | YAML | Auto (push/PR) |
| **Security Scanning** | Trivy | — | GitHub Actions |
| **Code Coverage** | Istanbul / nyc | — | `npm run test:coverage` |

---

## 3. Test Suite Summary

### Backend Tests (`backend/__tests__/`)

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `unit/auth.service.test.js` | Unit | Authentication service — login, registration, token generation, password hashing |
| `unit/admin.service.test.js` | Unit | Admin service — user management, dashboard stats, audit logs |
| `unit/healthLogs.service.test.js` | Unit | Health log service — CRUD operations, data encryption |
| `unit/authMiddleware.test.js` | Unit | Auth middleware — JWT validation, role checking, rate limiting |
| `integration/auth.integration.test.js` | Integration | Full authentication API flow — register, login, MFA, error handling |

### Frontend Tests (`frontend/src/__tests__/`)

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `unit/stores/auth.test.js` | Unit | Pinia auth store — login state, token management, logout |

### E2E Tests (`frontend/e2e/`)

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `critical-paths.e2e.js` | E2E | Complete user workflows — login with MFA, dashboard navigation, medication CRUD, profile management, accessibility, error handling |

---

## 4. Test Coverage Targets

| Component | Target | Actual |
|-----------|--------|--------|
| Backend Services | 70%+ | ~75% |
| Backend Middleware | 70%+ | ~72% |
| Frontend Stores | 60%+ | ~65% |
| E2E Critical Paths | 100% of critical flows | 6 test suites |

---

## 5. CI/CD Integration

All tests are integrated into the **GitHub Actions** pipeline (`.github/workflows/security.yml`):

```
Push to main/develop
        │
        ├─► Security Scan (Trivy)
        │
        ├─► Lint Backend (ESLint)
        │       │
        │       ▼
        ├─► Test Backend (Jest + PostgreSQL service)
        │       │
        │       ▼
        ├─► Build Backend
        │
        ├─► Test Frontend (Vitest)
        │       │
        │       ▼
        ├─► Build Frontend (Vite)
        │
        └─► Docker Build (main branch only)
```

---

## 6. How to Run Tests

### Backend
```bash
cd backend
npm install
npm test                 # Run all tests
npm run test:coverage    # Run with coverage report
```

### Frontend
```bash
cd frontend
npm install
npm test                 # Run unit tests
npm run test:coverage    # Run with coverage
npx playwright test      # Run E2E tests
```

### Healthcare Dashboard (React/Supabase)
```bash
cd "Healthcare Dashboard"
bun install
bun run test             # Run all tests via Vitest
bun run test:watch       # Watch mode
```

---

## 7. Testing Types Covered

| Testing Type | Status | Details |
|-------------|--------|---------|
| ✅ Unit Testing | Implemented | Jest (backend), Vitest (frontend) |
| ✅ Integration Testing | Implemented | API endpoint testing with Supertest |
| ✅ End-to-End Testing | Implemented | Playwright critical user paths |
| ✅ Regression Testing | Implemented | CI/CD pipeline on every push/PR |
| ✅ Mutation Testing | Configured | Stryker.js for mutation analysis |
| ✅ Security Testing | Implemented | Trivy vulnerability scanning |
| ✅ Accessibility Testing | Implemented | Playwright keyboard navigation & heading tests |

> **See individual documents for detailed screenshots and analysis:**
> - [Integration Testing](./integration_testing.md)
> - [Regression Testing](./regression_testing.md)
> - [Mutation Testing](./mutation_testing.md)
