# Admin Login Setup Guide

This guide will help you create an admin user account and set up admin access for the Health Zenith Shield application.

## Prerequisites

- Supabase project is set up and running
- Project URL: `https://iztkblknlikqvcbsaifq.supabase.co`
- The `user_roles` table exists (migration already applied)

## Step 1: Create Admin User in Supabase Auth

1. Navigate to your **Supabase Dashboard**
   - URL: `https://app.supabase.com/`
   - Select your project

2. Go to **Authentication** → **Users**

3. Click **"Add user"** button

4. Fill in the form:
   - **Email**: `admin@example.com` (or your preferred admin email)
   - **Password**: `Admin@12345` (create a strong password)
   - Check "Auto confirm user" (to bypass email verification)

5. Click **"Create user"**

You'll see a confirmation with the new user's UUID (e.g., `a1b2c3d4-...`). Copy this UUID.

## Step 2: Add Admin Role to User

1. In Supabase Dashboard, go to **SQL Editor**

2. Create a new query and run this SQL, replacing `YOUR_USER_UUID` with the UUID from Step 1:

```sql
-- Add admin role for the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'admin');
```

**Example:**
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');
```

3. Click **"Run"** button

✅ You should see: "Execute successfully"

## Step 3: Test Admin Login

1. Start the dev server if not running:
   ```bash
   npm run dev
   ```

2. Navigate to admin login page:
   - Go to: `http://localhost:8082/admin-login`
   - (Replace `8082` with your actual dev server port if different)

3. Enter credentials:
   - **Email**: `admin@example.com`
   - **Password**: `Admin@12345`

4. Click **"Sign In"**

✅ Should redirect to: `/admin` dashboard

## Admin Dashboard Features

Once logged in as admin, you'll have access to:

- **Dashboard**: Overview and statistics
- **Patient Management**: View and manage patient data
- **Medicine Shops**: Manage pharmacy locations
- **Hospitals**: Manage hospital information
- **Doctors**: Manage doctor profiles
- **Nursing Homes**: Manage nursing home data
- **Audit Logs**: View system activity logs
- **Admin Settings**: Configure system settings

---

## Troubleshooting

### "Access denied. This account does not have admin privileges."

**Solution**: The admin role wasn't added to `user_roles` table. Go to Step 2 and ensure the SQL query ran successfully.

### Admin Login page shows 404

**Solution**: Make sure you're accessing `/admin-login` (not `/login`).

### Email doesn't match what you see in Supabase

**Solution**: Make sure you copied the UUID correctly in Step 2.

### Want to create more admin users?

Repeat Steps 1-2 for each additional admin user.

---

## Creating Test Data

Once logged in as admin, you can:

1. **Add patients** through Admin Dashboard
2. **Manage locations** (hospitals, pharmacies, doctors, nursing homes)
3. **View health logs** and patient data
4. **Generate reports** from analytics section

---

## Security Notes

- ⚠️ **Never share** `admin@example.com` / `Admin@12345` credentials
- Use strong, unique passwords for production
- Regularly audit admin access in **Audit Logs**
- Consider using role-based access for specific admin functions

---

## Need Help?

If you encounter issues:

1. Check browser console (F12) for error messages
2. Verify Supabase credentials in `.env.local`
3. Ensure migrations have been applied
4. Check that `user_roles` table exists in Supabase database

