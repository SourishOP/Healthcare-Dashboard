# Regression Testing — Personalized Healthcare Dashboard

## 1. Overview

Regression testing ensures that new code changes, bug fixes, or feature additions do not break existing functionality. The Healthcare Dashboard implements regression testing through:

1. **Automated Test Suites** — Run on every code change
2. **CI/CD Pipeline** — GitHub Actions triggers full test suite on push/PR
3. **Test Coverage Monitoring** — Ensures coverage doesn't decrease
4. **Docker Build Verification** — Ensures containerized deployment remains stable

---

## 2. Regression Testing Strategy

### 2.1 Trigger Points

| Trigger | Action | Tests Run |
|---------|--------|-----------|
| `git push` to `main` or `develop` | GitHub Actions workflow | All tests + Docker build |
| Pull Request to `main` | GitHub Actions workflow | All tests (no Docker build) |
| Local development | Manual `npm test` | Unit + integration tests |
| Pre-deployment | `docker-compose build` | Full system integration |

### 2.2 Test Execution Order (CI/CD Pipeline)

```
1. Security Vulnerability Scan (Trivy)
        │
2. Lint Backend Code (ESLint)
        │
        ├──► 3a. Test Backend (Jest + PostgreSQL)
        │         ├── Unit tests (4 suites)
        │         ├── Integration tests (1 suite)
        │         └── Coverage check (70% threshold)
        │
        └──► 3b. Test Frontend (Vitest)
                  ├── Unit tests (store tests)
                  └── Coverage report
        │
4. Build Backend (npm ci + audit)
        │
5. Build Frontend (Vite production build)
        │
6. Docker Build (main branch only)
```

---

## 3. Regression Test Suites

### 3.1 Backend Regression Tests

These test suites are run on **every push** to catch regressions:

#### Authentication Service (`auth.service.test.js`)
| # | Test Case | What It Catches |
|---|-----------|----------------|
| 1 | User registration creates valid account | Registration flow regressions |
| 2 | Password hashing with Argon2 | Security regressions |
| 3 | JWT token generation with correct claims | Token format regressions |
| 4 | MFA secret generation (TOTP) | MFA feature regressions |
| 5 | Login with correct credentials | Auth flow regressions |
| 6 | Login rejection for invalid credentials | Security regressions |

#### Admin Service (`admin.service.test.js`)
| # | Test Case | What It Catches |
|---|-----------|----------------|
| 1 | List all users (admin only) | RBAC regressions |
| 2 | Get user details with health data | Data fetching regressions |
| 3 | Dashboard statistics calculation | Analytics regressions |
| 4 | Audit log creation | Compliance regressions |
| 5 | User role management | Permission system regressions |

#### Health Logs Service (`healthLogs.service.test.js`)
| # | Test Case | What It Catches |
|---|-----------|----------------|
| 1 | Create health log (encrypted) | Data entry regressions |
| 2 | Retrieve health logs for user | Data retrieval regressions |
| 3 | Update health log | CRUD regressions |
| 4 | Delete health log | Deletion regressions |
| 5 | AES-256-GCM encryption | Encryption regressions |

#### Auth Middleware (`authMiddleware.test.js`)
| # | Test Case | What It Catches |
|---|-----------|----------------|
| 1 | Valid JWT token passes | Auth middleware regressions |
| 2 | Expired token rejection | Token expiry regressions |
| 3 | Invalid token rejection | Security regressions |
| 4 | Admin role verification | RBAC middleware regressions |
| 5 | Rate limiting enforcement | DDoS protection regressions |

### 3.2 Frontend Regression Tests

#### Auth Store (`auth.test.js`)
| # | Test Case | What It Catches |
|---|-----------|----------------|
| 1 | Login sets auth state | State management regressions |
| 2 | Logout clears state | Session cleanup regressions |
| 3 | Token refresh mechanism | Token lifecycle regressions |
| 4 | Role-based routing | Navigation regressions |

---

## 4. Coverage Thresholds (Regression Guard)

The CI pipeline enforces minimum coverage to prevent regressions:

```bash
# From .github/workflows/security.yml
npx nyc check-coverage --lines 70 --functions 70
```

| Metric | Minimum Threshold |
|--------|------------------|
| Line Coverage | 70% |
| Function Coverage | 70% |
| Branch Coverage | 60% |

If coverage drops below these thresholds, the CI build **warns** (configured to not fail, allowing gradual improvement).

---

## 5. GitHub Actions CI/CD Workflow

### Workflow Configuration (`.github/workflows/security.yml`)

```yaml
name: Security & Build Pipeline

on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main"]

jobs:
  security-scan:        # Trivy vulnerability scan
  lint-backend:         # ESLint code quality
  test-backend:         # Jest tests + PostgreSQL service
  test-frontend:        # Vitest frontend tests
  build-backend:        # Production-ready backend
  build-frontend:       # Vite production build
  docker-build:         # Docker images (main only)
```

---

## 6. Screenshots

### 6.1 CI/CD Pipeline — All Tests Passing
> **Screenshot placeholder**: Capture GitHub Actions workflow showing all 7 jobs passing (security-scan, lint-backend, test-backend, test-frontend, build-backend, build-frontend, docker-build).

### 6.2 Test Suite Execution
> **Screenshot placeholder**: Capture terminal output of `npm test` showing all regression test suites passing with test counts.

### 6.3 Coverage Report
> **Screenshot placeholder**: Capture `npm run test:coverage` output showing line/function/branch coverage percentages.

### 6.4 Pull Request Check Status
> **Screenshot placeholder**: Capture a GitHub Pull Request page showing all CI checks passing.

---

## 7. Regression Testing Best Practices Followed

1. **Test-on-every-push**: All tests run automatically on every code push
2. **Independent test database**: CI uses a dedicated PostgreSQL service container
3. **Coverage monitoring**: Minimum thresholds prevent accidental regression
4. **Security scanning**: Trivy catches dependency vulnerabilities before merge
5. **Build verification**: Production builds are tested in CI to catch build regressions
6. **Docker verification**: Container builds are validated on main branch merges

---

## 8. How to Run Regression Tests Locally

```bash
# Run full regression suite (backend)
cd backend
npm test

# Run full regression suite (frontend)
cd frontend
npm test

# Run with coverage check
cd backend
npm run test:coverage
npx nyc check-coverage --lines 70 --functions 70

# Simulate CI pipeline locally
docker-compose build   # Verify Docker build
docker-compose up -d   # Start all services
curl http://localhost:5000/health  # Verify backend
```
