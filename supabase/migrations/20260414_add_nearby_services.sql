-- Create nearby services tables

-- Medicine shops table
CREATE TABLE public.medicine_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  opening_time TIME,
  closing_time TIME,
  is_open_24h BOOLEAN DEFAULT false,
  description TEXT,
  image_url TEXT,
  google_place_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medicine_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medicine shops"
  ON public.medicine_shops FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert medicine shops"
  ON public.medicine_shops FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update medicine shops"
  ON public.medicine_shops FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete medicine shops"
  ON public.medicine_shops FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  specialties TEXT[],
  emergency_services BOOLEAN DEFAULT false,
  ambulance_available BOOLEAN DEFAULT false,
  icu_beds INTEGER,
  beds INTEGER,
  description TEXT,
  image_url TEXT,
  google_place_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hospitals"
  ON public.hospitals FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert hospitals"
  ON public.hospitals FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hospitals"
  ON public.hospitals FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hospitals"
  ON public.hospitals FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0,
  experience_years INTEGER,
  qualifications TEXT[],
  consultation_fee DECIMAL(10, 2),
  availability TEXT,
  description TEXT,
  image_url TEXT,
  google_place_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doctors"
  ON public.doctors FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert doctors"
  ON public.doctors FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update doctors"
  ON public.doctors FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete doctors"
  ON public.doctors FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Nursing homes table
CREATE TABLE public.nursing_homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  capacity INTEGER,
  services TEXT[],
  staff_doctor BOOLEAN DEFAULT false,
  ambulance_available BOOLEAN DEFAULT false,
  description TEXT,
  image_url TEXT,
  google_place_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nursing_homes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view nursing homes"
  ON public.nursing_homes FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert nursing homes"
  ON public.nursing_homes FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update nursing homes"
  ON public.nursing_homes FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete nursing homes"
  ON public.nursing_homes FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Audit logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  table_name TEXT,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX medicine_shops_location_idx ON public.medicine_shops USING gist (ll_to_earth(latitude, longitude));
CREATE INDEX hospitals_location_idx ON public.hospitals USING gist (ll_to_earth(latitude, longitude));
CREATE INDEX doctors_location_idx ON public.doctors USING gist (ll_to_earth(latitude, longitude));
CREATE INDEX nursing_homes_location_idx ON public.nursing_homes USING gist (ll_to_earth(latitude, longitude));
CREATE INDEX audit_logs_admin_id_idx ON public.audit_logs(admin_id);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs(created_at);
