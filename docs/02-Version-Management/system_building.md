# System Building — Personalized Healthcare Dashboard

## 1. Overview

System building encompasses the processes, tools, and configurations used to compile, package, and deploy the Personalized Healthcare Dashboard. The project uses a **multi-stage build system** involving:

1. **Local Development** — Vite dev server with Hot Module Replacement
2. **Production Build** — Optimized static assets via Vite
3. **Containerization** — Docker multi-service orchestration
4. **CI/CD Pipeline** — Automated builds via GitHub Actions

---

## 2. Build Architecture

```
Source Code
    │
    ├── Frontend (Vue 3 / React)
    │   ├── Development: Vite Dev Server (HMR)
    │   └── Production:  Vite Build → dist/ → Nginx Container
    │
    ├── Backend (Express.js)
    │   ├── Development: Node.js with live reload
    │   └── Production:  Docker container (Node.js 18 Alpine)
    │
    └── Database (PostgreSQL 15)
        ├── Development: Docker container with init.sql
        └── Production:  Persistent volume mount
```

---

## 3. Frontend Build System

### 3.1 Vite Configuration

**Build Tool**: Vite 4.4 (Vue frontend) / Vite 5.4 (React frontend)

#### Vue Frontend (`frontend/vite.config.js`)
```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
});
```

#### React Frontend (`Healthcare Dashboard/vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  server: { port: 8080 },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
});
```

### 3.2 Build Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run dev` | Start dev server with HMR | http://localhost:8080 |
| `npm run build` | Production build | `dist/` directory |
| `npm run preview` | Preview production build | Local server |
| `npm run lint` | ESLint code quality check | Console output |

### 3.3 Build Output

```
dist/
├── assets/
│   ├── index-[hash].js       # Main application bundle
│   ├── index-[hash].css      # Compiled CSS
│   └── vendor-[hash].js      # Third-party libraries
├── index.html                 # Entry point
└── favicon.ico
```

---

## 4. Backend Build System

### 4.1 Node.js Configuration

The backend uses Express.js and doesn't require compilation (pure JavaScript), but the build process includes:

| Step | Tool | Purpose |
|------|------|---------|
| Dependency installation | `npm ci` | Deterministic install from lock file |
| Syntax validation | `node -c server.js` | Verify syntax correctness |
| Security audit | `npm audit` | Check for vulnerabilities |
| Linting | ESLint | Code quality enforcement |

### 4.2 Backend Scripts (`backend/package.json`)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "test:coverage": "jest --coverage --coverageReporters=json"
  }
}
```

---

## 5. Docker Containerization

### 5.1 Architecture

```
docker-compose.yml
    │
    ├── db (PostgreSQL 15 Alpine)
    │   ├── Port: 5432
    │   ├── Volume: postgres_data (persistent)
    │   ├── Init: backend/db/init.sql
    │   └── Health check: pg_isready
    │
    ├── backend (Node.js 18 Alpine)
    │   ├── Port: 5000
    │   ├── Depends on: db (healthy)
    │   ├── Volume: ./backend:/app (dev hot reload)
    │   └── Health check: curl http://localhost:5000/health
    │
    └── frontend (Nginx)
        ├── Port: 8080 → 80
        ├── Depends on: backend
        ├── Build: Multi-stage (Node build → Nginx serve)
        └── Health check: wget http://localhost/
```

### 5.2 Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### 5.3 Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 5.4 Docker Compose (`docker-compose.yml`)

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: healthcare_dashboard
    volumes:
      - ./backend/db/init.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_data:/var/lib/postgresql/data
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]

  backend:
    build: ./backend
    depends_on:
      db: { condition: service_healthy }
    environment:
      POSTGRES_HOST: db
      JWT_SECRET: ${JWT_SECRET}
      DB_ENCRYPTION_KEY: ${DB_ENCRYPTION_KEY}
    ports: ["5000:5000"]

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://localhost:5000
    depends_on: [backend]
    ports: ["8080:80"]

networks:
  healthcare-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

---

## 6. Environment Configuration

### 6.1 Backend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `PORT` | Server port | `5000` |
| `POSTGRES_HOST` | Database hostname | `db` (Docker) / `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `password` |
| `POSTGRES_DB` | Database name | `healthcare_dashboard` |
| `JWT_SECRET` | JWT signing key | `<secure-random-string>` |
| `DB_ENCRYPTION_KEY` | AES-256 encryption key | `<32-byte-key>` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:8080` |

### 6.2 Frontend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |

---

## 7. Build Commands Summary

### Development
```bash
# Start all services (Docker)
docker-compose up --build

# Start individually
cd backend && npm start       # Backend on :5000
cd frontend && npm run dev    # Frontend on :8080

# React/Supabase project
cd "Healthcare Dashboard"
bun run dev                   # Dev server on :8080
```

### Production
```bash
# Build frontend for production
cd frontend && npm run build

# Build Docker images
docker-compose build

# Run production containers
docker-compose up -d
```

### Verification
```bash
# Health checks
curl http://localhost:5000/health    # Backend
curl http://localhost:8080           # Frontend
docker-compose ps                    # Container status
```

---

## 8. Screenshots

### 8.1 Docker Compose Build
> **Screenshot placeholder**: Capture `docker-compose up --build` output showing all 3 services building and starting.

### 8.2 Docker Container Status
> **Screenshot placeholder**: Capture `docker-compose ps` or `docker ps` showing all containers running and healthy.

### 8.3 Vite Build Output
> **Screenshot placeholder**: Capture `npm run build` output showing bundle sizes and build time.

### 8.4 Development Server
> **Screenshot placeholder**: Capture Vite dev server running with HMR enabled and port information.

### 8.5 Docker Desktop
> **Screenshot placeholder**: Capture Docker Desktop UI showing the healthcare dashboard containers.
