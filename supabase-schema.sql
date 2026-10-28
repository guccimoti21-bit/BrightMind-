-- ==============================================================================
-- SciMathenova: Complete Production-Ready Supabase SQL Schema
-- Target Project: sjlmhdckpshyqeqihjgr
-- Database: PostgreSQL with Supabase Auth & Row Level Security (RLS)
-- ==============================================================================
-- Execution Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/sjlmhdckpshyqeqihjgr
-- 2. In the left navigation, click "SQL Editor" -> "New query".
-- 3. Paste this entire script into the editor and click "Run".
-- 4. After running, verify that the 6 tables appear in Table Editor:
--    - public.profiles
--    - public.chapters
--    - public.chapter_quizzes
--    - public.student_progress
--    - public.student_stats
--    - public.homepage_images
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Extensions & Custom Types
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 2: Tables Architecture
-- ------------------------------------------------------------------------------

-- 2.1 Profiles Table (Linked 1:1 to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  class_level SMALLINT NOT NULL DEFAULT 8 CHECK (class_level BETWEEN 6 AND 10),
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 Chapters / Concept Curriculum Catalog (Classes 6–10 for Science & Mathematics)
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  class_level SMALLINT NOT NULL CHECK (class_level BETWEEN 6 AND 10),
  subject_id TEXT NOT NULL CHECK (subject_id IN ('science', 'mathematics')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  estimated_hours NUMERIC(4, 1) DEFAULT 6.0,
  icon_name TEXT DEFAULT 'BookOpen',
  display_order INT DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Chapter Quizzes (Managed exclusively by Administrators)
CREATE TABLE IF NOT EXISTS public.chapter_quizzes (
  id TEXT PRIMARY KEY DEFAULT ('quiz-' || floor(random() * 899999 + 100000)::text),
  class_level SMALLINT NOT NULL CHECK (class_level BETWEEN 6 AND 10),
  subject_id TEXT NOT NULL CHECK (subject_id IN ('science', 'mathematics')),
  concept_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  chapter_title TEXT NOT NULL,
  title TEXT NOT NULL,
  quiz_url TEXT NOT NULL,
  platform_name TEXT NOT NULL DEFAULT 'External Quiz',
  description TEXT,
  time_limit_minutes INT CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
  question_count INT CHECK (question_count IS NULL OR question_count > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 Student Progress (Per-subconcept lesson, activity, practice, assessment)
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sub_concept_id TEXT NOT NULL,
  concept_id TEXT,
  lesson_completed BOOLEAN NOT NULL DEFAULT false,
  activity_completed BOOLEAN NOT NULL DEFAULT false,
  practice_completed BOOLEAN NOT NULL DEFAULT false,
  assessment_passed BOOLEAN NOT NULL DEFAULT false,
  assessment_best_score SMALLINT NOT NULL DEFAULT 0 CHECK (assessment_best_score BETWEEN 0 AND 100),
  assessment_attempts JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_completion SMALLINT NOT NULL DEFAULT 0 CHECK (overall_completion BETWEEN 0 AND 100),
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_subconcept UNIQUE (user_id, sub_concept_id)
);

-- 2.5 Student Stats (Study streak, total minutes, and active curriculum bookmark)
CREATE TABLE IF NOT EXISTS public.student_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_days INT NOT NULL DEFAULT 1 CHECK (streak_days >= 0),
  study_minutes INT NOT NULL DEFAULT 0 CHECK (study_minutes >= 0),
  last_active_date DATE DEFAULT CURRENT_DATE,
  last_active_sub_concept_id TEXT DEFAULT 'c8-math-linear-sub2',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.6 Homepage Images (Configured via Admin Panel: Image 1 and Image 2)
CREATE TABLE IF NOT EXISTS public.homepage_images (
  id TEXT PRIMARY KEY CHECK (id IN ('image1', 'image2')),
  image_url TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  storage_path TEXT,
  file_name TEXT,
  file_size INT,
  mime_type TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- STEP 3: Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles (class_level);
CREATE INDEX IF NOT EXISTS idx_chapters_class_subject ON public.chapters (class_level, subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lookup ON public.chapter_quizzes (class_level, subject_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON public.chapter_quizzes (is_active);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.student_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_subconcept ON public.student_progress (sub_concept_id);
CREATE INDEX IF NOT EXISTS idx_student_stats_active_date ON public.student_stats (last_active_date);

-- ------------------------------------------------------------------------------
-- STEP 4: Helper Functions & Privilege Enforcement
-- ------------------------------------------------------------------------------

-- 4.1 Fast, recursion-safe Administrator Checker
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- 1. Check JWT claims if configured
  IF (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin') THEN
    RETURN true;
  END IF;

  -- 2. Query profiles table with security definer (bypasses RLS recursion)
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4.2 Privilege Escalation Guard Trigger
-- Prevents ordinary users from tampering with their role
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- If role is changing, verify that caller is an administrator, service_role, or postgres session
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT (public.is_admin() OR auth.role() = 'service_role' OR session_user = 'postgres' OR current_user = 'postgres') THEN
        RAISE EXCEPTION 'Privilege escalation rejected: Only administrators can modify account roles.';
      END IF;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    -- If role is not 'student' upon insertion, verify admin authority
    IF NEW.role <> 'student' THEN
      IF NOT (public.is_admin() OR auth.role() = 'service_role' OR session_user = 'postgres' OR current_user = 'postgres') THEN
        NEW.role := 'student';
      END IF;
    END IF;
  END IF;
  
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 4.3 Automatic Profile Generation on Auth Registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_full_name TEXT;
  v_class_level SMALLINT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_class_level := COALESCE((NEW.raw_user_meta_data->>'class_level')::smallint, 8);

  IF v_class_level < 6 OR v_class_level > 10 THEN
    v_class_level := 8;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, class_level, role)
  VALUES (
    NEW.id,
    lower(NEW.email),
    v_full_name,
    v_class_level,
    'student' -- Strictly defaults to student
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    class_level = EXCLUDED.class_level,
    updated_at = timezone('utc'::text, now());

  -- Initialize student stats
  INSERT INTO public.student_stats (user_id, streak_days, study_minutes, last_active_sub_concept_id)
  VALUES (NEW.id, 1, 0, 'c8-math-linear-sub2')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- STEP 5: Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_images ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 5.2 Chapters Policies (Curriculum is publicly readable; editable by admins)
DROP POLICY IF EXISTS "chapters_select_policy" ON public.chapters;
CREATE POLICY "chapters_select_policy"
  ON public.chapters FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "chapters_admin_insert" ON public.chapters;
CREATE POLICY "chapters_admin_insert"
  ON public.chapters FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "chapters_admin_update" ON public.chapters;
CREATE POLICY "chapters_admin_update"
  ON public.chapters FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "chapters_admin_delete" ON public.chapters;
CREATE POLICY "chapters_admin_delete"
  ON public.chapters FOR DELETE
  USING (public.is_admin());

-- 5.3 Chapter Quizzes Policies (Active quizzes visible to all; managed by admins)
DROP POLICY IF EXISTS "quizzes_select_policy" ON public.chapter_quizzes;
CREATE POLICY "quizzes_select_policy"
  ON public.chapter_quizzes FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "quizzes_admin_insert" ON public.chapter_quizzes;
CREATE POLICY "quizzes_admin_insert"
  ON public.chapter_quizzes FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "quizzes_admin_update" ON public.chapter_quizzes;
CREATE POLICY "quizzes_admin_update"
  ON public.chapter_quizzes FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "quizzes_admin_delete" ON public.chapter_quizzes;
CREATE POLICY "quizzes_admin_delete"
  ON public.chapter_quizzes FOR DELETE
  USING (public.is_admin());

-- 5.4 Student Progress Policies
DROP POLICY IF EXISTS "progress_select_policy" ON public.student_progress;
CREATE POLICY "progress_select_policy"
  ON public.student_progress FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "progress_insert_policy" ON public.student_progress;
CREATE POLICY "progress_insert_policy"
  ON public.student_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_update_policy" ON public.student_progress;
CREATE POLICY "progress_update_policy"
  ON public.student_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_delete_policy" ON public.student_progress;
CREATE POLICY "progress_delete_policy"
  ON public.student_progress FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 5.5 Student Stats Policies
DROP POLICY IF EXISTS "stats_select_policy" ON public.student_stats;
CREATE POLICY "stats_select_policy"
  ON public.student_stats FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "stats_insert_policy" ON public.student_stats;
CREATE POLICY "stats_insert_policy"
  ON public.student_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stats_update_policy" ON public.student_stats;
CREATE POLICY "stats_update_policy"
  ON public.student_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.6 Homepage Images Policies (Public read; admin insert/update/delete)
DROP POLICY IF EXISTS "homepage_images_select_policy" ON public.homepage_images;
CREATE POLICY "homepage_images_select_policy"
  ON public.homepage_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "homepage_images_admin_insert" ON public.homepage_images;
CREATE POLICY "homepage_images_admin_insert"
  ON public.homepage_images FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "homepage_images_admin_update" ON public.homepage_images;
CREATE POLICY "homepage_images_admin_update"
  ON public.homepage_images FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "homepage_images_admin_delete" ON public.homepage_images;
CREATE POLICY "homepage_images_admin_delete"
  ON public.homepage_images FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- STEP 6: Pre-seed Curriculum Chapters (Classes 6 to 10)
-- ------------------------------------------------------------------------------
INSERT INTO public.chapters (id, class_level, subject_id, title, description, category, display_order, icon_name)
VALUES
  -- Class 6
  ('c6-math-fractions', 6, 'mathematics', 'Fractions and Decimals', 'Understand parts of a whole, equivalent fractions, comparing fractions, and arithmetic with decimals.', 'Arithmetic & Numbers', 1, 'PieChart'),
  ('c6-sci-plants', 6, 'science', 'Getting to Know Plants', 'Explore roots, stems, leaves, flowers, venation patterns, and photosynthesis in the plant kingdom.', 'Biology', 2, 'Sprout'),

  -- Class 7
  ('c7-math-integers', 7, 'mathematics', 'Integers and Operations', 'Master positive and negative numbers, the number line, addition and multiplication properties of integers.', 'Number Systems', 1, 'Binary'),
  ('c7-sci-nutrition', 7, 'science', 'Nutrition in Plants and Animals', 'Autotrophic and heterotrophic nutrition, digestion in humans, ruminants, and nutrient assimilation.', 'Biology', 2, 'Utensils'),

  -- Class 8 (Primary Featured Modules)
  ('c8-math-linear-eq', 8, 'mathematics', 'Linear Equations in One Variable', 'Master algebraic expressions, the balance method of equality, transposing terms, and real-world modeling.', 'Algebra', 1, 'Scale'),
  ('c8-math-rational', 8, 'mathematics', 'Rational Numbers', 'Properties of rational numbers: closure, commutativity, associativity, and representation on a number line.', 'Number Systems', 2, 'Hash'),
  ('c8-sci-light', 8, 'science', 'Light and Reflection', 'Laws of reflection, plane and curved mirrors, diffuse vs regular reflection, human eye anatomy and care.', 'Physics', 3, 'Sun'),
  ('c8-sci-force', 8, 'science', 'Force and Pressure', 'Contact vs non-contact forces, net forces, pressure exerted by liquids, gases, and atmospheric pressure.', 'Physics', 4, 'Activity'),

  -- Class 9
  ('c9-math-poly', 9, 'mathematics', 'Polynomials and Factorization', 'Zeroes of polynomials, Remainder and Factor theorems, standard algebraic identities, and factoring.', 'Algebra', 1, 'Variable'),
  ('c9-sci-motion', 9, 'science', 'Motion and Laws of Motion', 'Distance, displacement, velocity-time relationships, Newton three laws of motion, momentum and inertia.', 'Physics', 2, 'Gauge'),

  -- Class 10
  ('c10-math-quadratic', 10, 'mathematics', 'Quadratic Equations', 'Standard form ax² + bx + c = 0, solving by factoring, quadratic formula, and discriminant nature of roots.', 'Algebra', 1, 'Calculator'),
  ('c10-sci-electricity', 10, 'science', 'Electricity and Circuits', 'Electric current, potential difference, Ohm law, series and parallel circuits, electrical power and energy.', 'Physics', 2, 'Zap')
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- STEP 7: Secure Administrator Bootstrap Function
-- ------------------------------------------------------------------------------
-- This stored procedure allows the database owner in the Supabase SQL Editor
-- to promote any registered Auth email to an administrator.
CREATE OR REPLACE FUNCTION public.bootstrap_admin_account(admin_email TEXT)
RETURNS text AS $$
DECLARE
  v_user_id UUID;
  v_trimmed_email TEXT;
BEGIN
  v_trimmed_email := lower(trim(admin_email));

  -- Lookup if user already exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = v_trimmed_email;

  -- If user does not exist in auth.users, auto-create account with master key 434241
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_current,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_trimmed_email,
      crypt('434241', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
      '{"full_name":"Primary Administrator"}'::jsonb,
      now(),
      now(),
      '', '', '', ''
    );

    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_user_id,
        v_user_id,
        format('{"sub":"%s","email":"%s"}', v_user_id::text, v_trimmed_email)::jsonb,
        'email',
        now(),
        now(),
        now()
      ) ON CONFLICT (provider, id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  ELSE
    -- User already exists: update password to master key 434241 and confirm email
    UPDATE auth.users
    SET encrypted_password = crypt('434241', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- Upsert profile with administrator role
  INSERT INTO public.profiles (id, email, full_name, class_level, role)
  VALUES (v_user_id, v_trimmed_email, 'Primary Administrator', 10, 'admin')
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'admin',
    updated_at = timezone('utc'::text, now());

  -- Set master key password '434241' and sync role claims in auth.users
  UPDATE auth.users
  SET encrypted_password = crypt('434241', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = v_user_id;

  RETURN 'SUCCESS: Account ' || v_trimmed_email || ' is now an authorized administrator with master password 434241.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Protect the bootstrap function: Only database owners (postgres / service_role) can execute it
REVOKE ALL ON FUNCTION public.bootstrap_admin_account(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bootstrap_admin_account(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_account(TEXT) TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- STEP 8: Supabase Storage Bucket Setup for Homepage Images
-- ------------------------------------------------------------------------------
-- Create the public bucket 'homepage-images' if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('homepage-images', 'homepage-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Anyone can view homepage images (Public Read)
DROP POLICY IF EXISTS "Public View Homepage Images" ON storage.objects;
CREATE POLICY "Public View Homepage Images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'homepage-images');

-- Storage Policy: Administrators can upload homepage images
DROP POLICY IF EXISTS "Admin Upload Homepage Images" ON storage.objects;
CREATE POLICY "Admin Upload Homepage Images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'homepage-images' AND public.is_admin());

-- Storage Policy: Administrators can update/replace homepage images
DROP POLICY IF EXISTS "Admin Update Homepage Images" ON storage.objects;
CREATE POLICY "Admin Update Homepage Images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'homepage-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'homepage-images' AND public.is_admin());

-- Storage Policy: Administrators can delete homepage images
DROP POLICY IF EXISTS "Admin Delete Homepage Images" ON storage.objects;
CREATE POLICY "Admin Delete Homepage Images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'homepage-images' AND public.is_admin());

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
