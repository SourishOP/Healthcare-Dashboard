-- ============================================
-- FIX: Infinite recursion in user_roles RLS policy
-- ============================================
-- Run this in Supabase SQL Editor to fix the admin login issue.
-- The problem: "Admins can view all roles" policy queries user_roles
-- to check if the user is admin, which triggers the same policy again
-- causing infinite recursion (error 42P17).

-- Step 1: Create a SECURITY DEFINER function that bypasses RLS
-- This function checks if a user is an admin WITHOUT triggering RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  )
$$;

-- Step 2: Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Step 3: Recreate it using the SECURITY DEFINER function (no recursion)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Step 4: Also fix the same recursion issue on other tables
-- (profiles, health_logs, medications, audit_logs all have the same pattern)

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all health logs" ON public.health_logs;
CREATE POLICY "Admins can view all health logs"
  ON public.health_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all medications" ON public.medications;
CREATE POLICY "Admins can view all medications"
  ON public.medications FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all nutrition logs" ON public.nutrition_logs;
CREATE POLICY "Admins can view all nutrition logs"
  ON public.nutrition_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all sleep logs" ON public.sleep_logs;
CREATE POLICY "Admins can view all sleep logs"
  ON public.sleep_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all fitness logs" ON public.fitness_logs;
CREATE POLICY "Admins can view all fitness logs"
  ON public.fitness_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- DONE! Admin login should now work.
-- ============================================
