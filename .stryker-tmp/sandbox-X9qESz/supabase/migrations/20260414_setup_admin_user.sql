-- ============================================
-- ADMIN USER SETUP SCRIPT FOR SUPABASE
-- ============================================
-- 
-- This script sets up an admin user in the Supabase database.
-- 
-- INSTRUCTIONS:
-- 1. In Supabase Dashboard → SQL Editor
-- 2. Copy this entire script
-- 3. Replace the placeholder values (marked with {{  }})
-- 4. Click "Run"
-- 5. You should see "Execute successfully"
--
-- ============================================

-- Step 1: Find the admin user by email
-- (You must create the user first in Supabase Auth → Users)
-- 
-- Go to Supabase Dashboard:
-- - Click "Authentication" → "Users"
-- - Click "Add user"
-- - Email: admin@example.com
-- - Password: (create a strong password)
-- - Check "Auto confirm user"
-- - Click "Create user"
-- - Copy the UUID from the user list
--
-- Then, replace 'YOUR_USER_UUID_HERE' in the query below

-- Step 2: Add the admin role
-- Copy and paste this into SQL Editor, replacing YOUR_USER_UUID_HERE:

INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID_HERE', 'admin');

-- Expected output: "Execute successfully"

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the admin user was created:

SELECT 
  u.id,
  u.email,
  ur.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@example.com';

-- Expected output: One row with role = 'admin'

-- ============================================
-- OPTIONAL: Create multiple admin users
-- ============================================
-- Uncomment and modify as needed:

-- INSERT INTO public.user_roles (user_id, role)
-- VALUES 
--   ('UUID_OF_ADMIN_2', 'admin'),
--   ('UUID_OF_ADMIN_3', 'admin');

-- ============================================
-- OPTIONAL: Change a patient to admin
-- ============================================
-- If you have an existing patient and want to make them admin:

-- UPDATE public.user_roles
-- SET role = 'admin'
-- WHERE user_id = 'PATIENT_UUID_HERE';

-- ============================================
-- OPTIONAL: Remove admin privileges
-- ============================================
-- To demote an admin back to patient:

-- UPDATE public.user_roles
-- SET role = 'patient'
-- WHERE user_id = 'ADMIN_UUID_HERE' AND role = 'admin';

-- ============================================
