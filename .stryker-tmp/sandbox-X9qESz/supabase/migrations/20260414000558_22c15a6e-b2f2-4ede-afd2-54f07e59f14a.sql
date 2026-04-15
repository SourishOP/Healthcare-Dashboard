
-- Admin can update health_logs
CREATE POLICY "Admins can update health logs"
ON public.health_logs FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can delete health_logs
CREATE POLICY "Admins can delete health logs"
ON public.health_logs FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can update medications
CREATE POLICY "Admins can update medications"
ON public.medications FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can delete medications
CREATE POLICY "Admins can delete medications"
ON public.medications FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can update nutrition_logs
CREATE POLICY "Admins can update nutrition logs"
ON public.nutrition_logs FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can delete nutrition_logs
CREATE POLICY "Admins can delete nutrition logs"
ON public.nutrition_logs FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can update sleep_logs
CREATE POLICY "Admins can update sleep logs"
ON public.sleep_logs FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can delete sleep_logs
CREATE POLICY "Admins can delete sleep logs"
ON public.sleep_logs FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can update fitness_logs
CREATE POLICY "Admins can update fitness logs"
ON public.fitness_logs FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can delete fitness_logs
CREATE POLICY "Admins can delete fitness logs"
ON public.fitness_logs FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admin can update profiles
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));
