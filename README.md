# 🏥 Healthcare Dashboard

A modern, comprehensive healthcare management platform designed to streamline patient care, health monitoring, and administrative operations. This full-stack application enables patients to track their health metrics and discover nearby healthcare services, while providing administrators with powerful tools to manage healthcare infrastructure and patient data.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Authentication & Authorization](#authentication--authorization)
- [User Roles](#user-roles)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

The Healthcare Dashboard is a dual-interface application serving two primary user groups:

**Patients** gain access to a personal health management system where they can:
- Monitor and log vital signs (heart rate, blood pressure, temperature, etc.)
- Track health trends with rich visualizations
- Manage medications and treatment plans
- Monitor nutrition and fitness activities
- Track sleep patterns
- Discover nearby hospitals, clinics, and medical services

**Administrators** receive a comprehensive management interface to:
- Oversee all patient data and health records
- Manage healthcare facilities (hospitals, medicine shops, nursing homes)
- Administer healthcare professionals (doctors)
- Monitor system activity through detailed audit logs
- Analyze data with advanced data explorer tools
- Configure system-wide settings

---

## ✨ Key Features

### For Patients
- 🔐 **Secure Authentication** - Email-based login with encrypted passwords
- 📊 **Health Dashboard** - At-a-glance overview of vital health metrics
- 📈 **Health Trends** - Visualize health data over time with interactive charts
- 💊 **Medication Management** - Track prescribed medications and doses
- 🥗 **Nutrition Tracker** - Log meals and dietary information
- 😴 **Sleep Monitoring** - Record and analyze sleep patterns
- 🏃 **Fitness Tracking** - Monitor workout and physical activity
- 🏥 **Nearby Services** - Discover nearby hospitals, clinics, and pharmacies with location data
- 🔔 **Real-time Notifications** - Stay informed with system notifications

### For Administrators
- 👥 **Patient Management** - View comprehensive patient profiles and medical history
- 🏥 **Healthcare Facilities Management** - Administer hospitals, clinics, and nursing homes
- 💊 **Medicine Shop Management** - Manage pharmacy locations and inventory
- 👨‍⚕️ **Doctor Directory** - Maintain healthcare professional information
- 📋 **Audit Logs** - Complete system activity tracking for compliance
- 🔍 **Data Explorer** - Advanced data querying and analysis tools
- ⚙️ **System Settings** - Configure application-wide parameters
- 📊 **Analytics Dashboard** - View key performance indicators and statistics

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4 with custom animations
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack React Query 5.83
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM 6.30
- **Charts & Visualization**: Recharts 2.15
- **Icons**: Lucide React
- **Animations**: Framer Motion 12.38
- **Notifications**: Sonner Toast
- **Theme**: next-themes for light/dark mode

### Backend & Data
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time API**: Supabase REST API
- **Row-Level Security**: PostgreSQL RLS policies

### Development Tools
- **Code Quality**: ESLint 9.32 with TypeScript support
- **Testing**: Vitest 3.2
- **Type Checking**: TypeScript 5.8
- **Package Manager**: Bun
- **Version Control**: Git

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16.x or higher (or **Bun** for faster package management)
- **Git** for version control
- **Supabase Account** - Free tier available at [supabase.com](https://supabase.com)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Recommended Tools
- SQL Editor (for database management)
- REST API client like Postman or Insomnia
- IDE like VS Code with TypeScript support

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd "Healthcare Dashboard"
```

### Step 2: Install Dependencies

Using **Bun** (recommended for faster installation):
```bash
bun install
```

Or using **npm**:
```bash
npm install
```

### Step 3: Configure Supabase

1. **Create a Supabase Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Follow the setup wizard
   - Note your **Project URL** and **API Key**

2. **Create Environment Variables**
   
   Create a `.env.local` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Apply Database Migrations**
   
   Navigate to Supabase SQL Editor and run the SQL scripts in this order:
   - `SQL_CREATE_TABLES.sql` - Creates all required tables
   - `SQL_FIX_RLS.sql` - Configures Row-Level Security policies
   - `supabase/migrations/*.sql` - Additional migrations (run in chronological order)

### Step 4: Verify Installation

```bash
# Check if dependencies are installed
bun list

# Lint the project
bun run lint
```

---

## ⚡ Getting Started

### Start the Development Server

```bash
bun run dev
```

The application will be available at:
- **Local**: http://localhost:8080
- **Network**: Check terminal output for your machine's IP

### Create Your First Accounts

#### Patient Account (for testing the patient dashboard)
1. Navigate to http://localhost:8080/register
2. Fill in your email and password
3. Click "Register"
4. You'll be automatically logged in and redirected to the patient dashboard

#### Admin Account (for managing the system)

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed instructions on creating admin accounts.

Quick reference:
1. Create a user in Supabase Auth
2. Add the admin role via SQL: `INSERT INTO user_roles (user_id, role) VALUES ('uuid', 'admin')`
3. Login at http://localhost:8080/admin-login

---

## 📁 Project Structure

```
Healthcare Dashboard/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── ui/              # shadcn/ui components library
│   │   ├── NavLink.tsx       # Navigation link component
│   │   ├── ProtectedRoute.tsx # Route protection component
│   │   └── StatCard.tsx      # Statistics card component
│   │
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── PatientManagementPage.tsx
│   │   │   ├── PatientDetailPage.tsx
│   │   │   ├── DoctorsManagementPage.tsx
│   │   │   ├── HospitalsManagementPage.tsx
│   │   │   ├── MedicineShopsManagementPage.tsx
│   │   │   ├── NursingHomesManagementPage.tsx
│   │   │   ├── AuditLogsPage.tsx
│   │   │   ├── AdminDataExplorerPage.tsx
│   │   │   └── AdminSettingsPage.tsx
│   │   │
│   │   ├── patient/         # Patient dashboard pages
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── LogVitalsPage.tsx
│   │   │   ├── HealthTrendsPage.tsx
│   │   │   ├── MedicationsPage.tsx
│   │   │   ├── NutritionPage.tsx
│   │   │   ├── SleepPage.tsx
│   │   │   ├── FitnessPage.tsx
│   │   │   └── NearbyServicesPage.tsx
│   │   │
│   │   ├── LoginPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── NotFound.tsx
│   │
│   ├── layouts/             # Layout components
│   │   ├── PatientLayout.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx  # Authentication and authorization
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   │
│   ├── integrations/        # External service integrations
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client configuration
│   │       └── types.ts     # TypeScript types for Supabase
│   │
│   ├── lib/                 # Utility functions
│   │   └── utils.ts
│   │
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
│
├── supabase/                # Database migrations and config
│   ├── config.toml          # Supabase configuration
│   └── migrations/          # SQL migration files
│
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## 📜 Available Scripts

### Development
```bash
bun run dev          # Start development server with HMR
bun run lint         # Run ESLint to check code quality
bun run build        # Build for production
bun run build:dev    # Build in development mode
bun run preview      # Preview production build locally
```

### Testing
```bash
bun run test         # Run tests once
bun run test:watch   # Run tests in watch mode
```

### Production
```bash
bun run build        # Build optimized production bundle
bun run preview      # Serve production build locally for testing
```

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────┐
│      Browser / Frontend (React)      │
│   - Patient Dashboard               │
│   - Admin Dashboard                 │
│   - Authentication UI               │
└────────────────┬────────────────────┘
                 │ HTTP/HTTPS
                 ▼
┌─────────────────────────────────────┐
│    Supabase (Backend Services)       │
│  ┌────────────────────────────────┐  │
│  │  PostgreSQL Database           │  │
│  │  - Users                       │  │
│  │  - Patient Health Records      │  │
│  │  - Healthcare Facilities       │  │
│  │  - Audit Logs                  │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Authentication Service        │  │
│  │  - Email/Password Auth         │  │
│  │  - Session Management          │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  REST API & Real-time Updates  │  │
│  │  - Real-time Database Changes  │  │
│  └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**
   - User submits credentials
   - Supabase Auth validates and returns session token
   - Frontend stores session in React Context
   - Protected routes check user role

2. **Patient Data Management**
   - Patient updates health metrics
   - Data sent to Supabase
   - Real-time UI update via React Query
   - Audit log automatically created

3. **Admin Data Access**
   - Admin queries patient data
   - Row-Level Security (RLS) ensures data privacy
   - Results displayed with visualizations
   - All access logged in audit trail

### Security

- **Row-Level Security (RLS)**: PostgreSQL policies ensure users only access their own data
- **Token-Based Auth**: Supabase JWT tokens for stateless authentication
- **Environment Variables**: Sensitive keys stored in `.env.local` (never committed)
- **Type Safety**: TypeScript prevents many common security errors
- **Protected Routes**: Frontend route guards prevent unauthorized access

---

## 🔐 Authentication & Authorization

### How Authentication Works

1. **Supabase Auth** handles user registration and login
2. **JWT Token** returned by Supabase on successful authentication
3. **Token Stored** in browser session (Supabase manages this)
4. **Role Verification** happens on app load via AuthContext

### User Roles

The system supports two primary roles:

#### 👤 Patient Role
- Access to personal health dashboard
- Can view and edit own health data only
- Cannot access admin functions
- Cannot see other patients' data

#### 👨‍💼 Admin Role
- Full access to all patient data (governed by RLS)
- Can manage healthcare facilities
- Can manage healthcare professionals
- Can view audit logs
- Can configure system settings
- Can access data explorer

### Setting User Roles

Roles are managed in the `user_roles` table in Supabase:

```sql
-- Grant patient role
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'patient');

-- Grant admin role  
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed admin setup instructions.

---

## 🐛 Troubleshooting

### Development Server Issues

**Problem:** Port 8080 is already in use
```bash
# Solution: Use a different port
bun run dev --port 3000
```

**Problem:** Vite dev server not starting
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
bun run dev
```

### Authentication Issues

**Problem:** "Unable to connect to Supabase"
- Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify Supabase project is active
- Check network connectivity

**Problem:** "Access denied" after login
- Verify user role is properly set in `user_roles` table
- Check RLS policies are enabled in Supabase
- See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for role setup

**Problem:** Session expires frequently
- Increase token refresh interval in `supabase/config.toml`
- Check Supabase Auth settings
- Clear browser cookies and try again

### Database Issues

**Problem:** "Relations does not exist" error
- Run SQL migrations in order
- Check migrations were successful
- Verify database is connected

**Problem:** RLS blocking queries
- Check RLS policies are correct
- Verify user ID in policies matches Supabase auth user ID
- See `SQL_FIX_RLS.sql` for RLS configuration

### Build Issues

**Problem:** "Cannot find module '@/...'"
- Verify `tsconfig.json` has correct path alias
- Check vite.config.ts has correct alias resolution
- Restart dev server

**Problem:** TypeScript errors during build
```bash
# Strict type checking
bun run build

# Check specific file
npx tsc --noEmit src/pages/LoginPage.tsx
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add TypeScript types
   - Test your changes locally

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues

### Code Style Guidelines

- Use TypeScript for type safety
- Follow Prettier formatting (configured in project)
- Use descriptive variable and function names
- Add comments for complex logic
- Keep components focused and single-responsibility

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vite Guide](https://vitejs.dev/guide/)

---

## 📝 License

This project is proprietary and all rights reserved. Unauthorized copying or distribution is prohibited.

---

## 📞 Support & Contact

For issues, bug reports, or feature requests, please use the issue tracker in the repository.

For direct support or inquiries, contact the development team.

---

<div align="center">

**Made with ❤️ for better healthcare management**

Last updated: April 2026

</div>
