# Version Management — Personalized Healthcare Dashboard

## 1. Overview

Version management for the Personalized Healthcare Dashboard is handled through **Git** as the distributed version control system, **GitHub** as the remote hosting platform, and **GitHub Actions** for continuous integration and deployment automation.

---

## 2. Repositories

| Repository | URL | Purpose |
|------------|-----|---------|
| **Healthcare Dashboard** (React + Supabase) | [github.com/SourishOP/Healthcare-Dashboard](https://github.com/SourishOP/Healthcare-Dashboard) | Frontend-only SPA with Supabase BaaS |
| **Personalized Healthcare Dashboard** (Full-stack) | [github.com/SourishOP/personalized-healthcare-dashboard](https://github.com/SourishOP/personalized-healthcare-dashboard) | Full-stack: Vue 3 + Express.js + PostgreSQL + Docker |

---

## 3. Branching Strategy

We follow a simplified **Git Flow** model:

```
main (production)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feat/patient-dashboard
  │     ├── feat/admin-panel
  │     ├── feat/mfa-integration
  │     ├── feat/testing-infrastructure
  │     └── fix/login-hang
  │
  └── hotfix/critical-fix (emergency patches)
```

### Branch Naming Convention

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feat/<description>` | `feat/patient-dashboard` |
| Bug Fix | `fix/<description>` | `fix/login-hang` |
| Hotfix | `hotfix/<description>` | `hotfix/auth-bypass` |
| Release | `release/<version>` | `release/v1.0.0` |

---

## 4. Commit History

### Healthcare Dashboard (React + Supabase)

| Commit Hash | Message | Description |
|-------------|---------|-------------|
| `cc99348` | Updating the README.md file with new information | Documentation update with project structure and usage |
| `df16cac` | first commit | Initial project setup with React, TypeScript, Vite, Supabase |

### Personalized Healthcare Dashboard (Full-stack)

| Commit Hash | Message | Phase | Description |
|-------------|---------|-------|-------------|
| `f3d2c79` | feat: Phase 5 - Comprehensive Testing Infrastructure | Phase 5 | Added Jest, Vitest, Playwright tests, CI/CD pipeline, 70%+ coverage |
| `3fad905` | feat: complete all 9 patient-facing pages | Phase 4 | Dashboard, Vitals, Trends, Medications, Nutrition, Goals, etc. |
| `48511f8` | feat: complete admin interface with 11 management pages | Phase 3 | Admin dashboard, user management, audit logs |
| `d6f65ab` | feat: comprehensive platform enhancements | Phase 2 | Production readiness, security hardening, WebSocket |
| `0f1f2bf` | feat: complete UI design overhaul and MFA integration | Phase 1 | UI redesign, TOTP-based MFA, theme system |
| `320ebf4` | photos-and-diagrams-commit | — | Architecture diagrams and screenshots |
| `b6f2e3a` | Initial commit | — | Project scaffolding |
| `3ec7671` | README.md | — | Initial documentation |
| `2cb32fe` | Initial commit | — | Repository creation |

---

## 5. Version Releases

### Semantic Versioning (SemVer)

We follow `MAJOR.MINOR.PATCH` versioning:

| Version | Date | Milestone |
|---------|------|-----------|
| v0.1.0 | Feb 2026 | Initial project setup, basic auth, database schema |
| v0.2.0 | Feb 2026 | UI overhaul, MFA integration |
| v0.3.0 | Mar 2026 | Platform enhancements, security hardening |
| v0.4.0 | Mar 2026 | Admin interface (11 pages) |
| v0.5.0 | Mar 2026 | Patient pages (9 pages) |
| v0.6.0 | Apr 2026 | Testing infrastructure, CI/CD |
| v1.0.0 | Apr 2026 | Production-ready release (current) |

---

## 6. CI/CD Pipeline (GitHub Actions)

### Workflow: Security & Build Pipeline

**File**: `.github/workflows/security.yml`

**Triggers**:
- Push to `main` or `develop`
- Pull Request to `main`

### Pipeline Stages

```
┌──────────────────────────────────────────────────────────────────┐
│                    Security & Build Pipeline                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage 1: Security Scan                                         │
│  ┌─────────────────────────────┐                                │
│  │ Trivy Vulnerability Scanner │ CRITICAL + HIGH severity       │
│  └─────────────────────────────┘                                │
│               │                                                  │
│  Stage 2: Code Quality                                          │
│  ┌─────────────────────────────┐                                │
│  │ ESLint (Backend)            │ Max 10 warnings                │
│  └─────────────────────────────┘                                │
│               │                                                  │
│  Stage 3: Testing (Parallel)                                    │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ Test Backend          │  │ Test Frontend         │            │
│  │ • Jest + PostgreSQL   │  │ • Vitest              │            │
│  │ • Coverage: 70%+     │  │ • Coverage report     │            │
│  │ • Codecov upload     │  │ • Codecov upload      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│               │                       │                          │
│  Stage 4: Build (Parallel)                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ Build Backend         │  │ Build Frontend        │            │
│  │ • npm audit           │  │ • Vite production     │            │
│  │ • Syntax check        │  │   build               │            │
│  └──────────────────────┘  └──────────────────────┘            │
│               │                       │                          │
│  Stage 5: Docker (main only)                                    │
│  ┌────────────────────────────────┐                             │
│  │ docker-compose build           │                             │
│  └────────────────────────────────┘                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Git Workflow Example

### Feature Development

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feat/health-trends

# 2. Develop and commit
git add .
git commit -m "feat: add health trends visualization with Recharts"

# 3. Push and create PR
git push origin feat/health-trends
# Create Pull Request on GitHub: feat/health-trends → develop

# 4. CI runs automatically
# • Security scan, lint, test, build

# 5. Merge after review
# Merge PR on GitHub

# 6. Deploy
git checkout main
git merge develop
git push origin main
# Docker build triggers on main push
```

### Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/auth-bypass

# 2. Fix and commit
git add .
git commit -m "hotfix: fix authentication bypass vulnerability"

# 3. Merge to main AND develop
git checkout main
git merge hotfix/auth-bypass
git push origin main

git checkout develop
git merge hotfix/auth-bypass
git push origin develop
```

---

## 8. Screenshots

### 8.1 Git Commit History
> **Screenshot placeholder**: Capture `git log --oneline --graph` output showing branching and merge history.

### 8.2 GitHub Repository
> **Screenshot placeholder**: Capture GitHub repository page showing code, branches, and recent commits.

### 8.3 GitHub Actions Workflow
> **Screenshot placeholder**: Capture GitHub Actions page showing successful pipeline runs.

### 8.4 Pull Request with CI Checks
> **Screenshot placeholder**: Capture a GitHub PR page showing required status checks passing.

### 8.5 Branch Protection Rules
> **Screenshot placeholder**: Capture GitHub branch protection settings for the main branch.
