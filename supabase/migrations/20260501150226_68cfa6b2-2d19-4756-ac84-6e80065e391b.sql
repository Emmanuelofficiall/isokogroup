-- Software bookings
CREATE TABLE public.software_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  project_description TEXT NOT NULL,
  budget_range TEXT,
  preferred_deadline DATE,
  consultation_type TEXT NOT NULL DEFAULT 'online',
  consultation_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  agreed_price INTEGER,
  deposit_paid BOOLEAN NOT NULL DEFAULT false,
  deposit_paid_at TIMESTAMPTZ,
  final_paid BOOLEAN NOT NULL DEFAULT false,
  final_paid_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.software_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create software bookings"
  ON public.software_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own software bookings"
  ON public.software_bookings FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins update software bookings"
  ON public.software_bookings FOR UPDATE
  USING (is_admin());

CREATE TRIGGER software_bookings_updated_at
  BEFORE UPDATE ON public.software_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Software courses
CREATE TABLE public.software_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  mode TEXT NOT NULL DEFAULT 'online',
  price INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.software_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active software courses"
  ON public.software_courses FOR SELECT
  USING (active = true OR is_admin());

CREATE POLICY "Admins insert software courses"
  ON public.software_courses FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins update software courses"
  ON public.software_courses FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins delete software courses"
  ON public.software_courses FOR DELETE
  USING (is_admin());

CREATE TRIGGER software_courses_updated_at
  BEFORE UPDATE ON public.software_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Course registrations
CREATE TABLE public.course_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  course_id UUID REFERENCES public.software_courses(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  course_title TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'online',
  experience_level TEXT NOT NULL DEFAULT 'beginner',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own registrations"
  ON public.course_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own registrations"
  ON public.course_registrations FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins update registrations"
  ON public.course_registrations FOR UPDATE
  USING (is_admin());

CREATE TRIGGER course_registrations_updated_at
  BEFORE UPDATE ON public.course_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few starter courses
INSERT INTO public.software_courses (title, description, level, mode, price, duration) VALUES
  ('Web Development', 'Learn HTML, CSS, JavaScript, React and build modern websites.', 'beginner', 'online', 150000, '8 weeks'),
  ('UI/UX Design', 'Master Figma, design systems, and user research fundamentals.', 'beginner', 'online', 120000, '6 weeks'),
  ('Advanced Programming', 'Algorithms, data structures, TypeScript and backend with Node.', 'advanced', 'physical', 250000, '12 weeks');