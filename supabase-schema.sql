-- ==============================================================
-- BrightMind Learning: Supabase Database Schema & RLS Policies
-- Compatible with Supabase Auth & PostgreSQL
-- ==============================================================

-- 1. Create enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table: Stores public student profile information linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  class_level SMALLINT NOT NULL DEFAULT 8 CHECK (class_level BETWEEN 6 AND 10),
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Student Progress Table: Tracks per-subconcept completion, scores, and unlock status
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sub_concept_id TEXT NOT NULL,
  concept_id TEXT,
  lesson_completed BOOLEAN NOT NULL DEFAULT false,
  activity_completed BOOLEAN NOT NULL DEFAULT false,
  practice_completed BOOLEAN NOT NULL DEFAULT false,
  assessment_passed BOOLEAN NOT NULL DEFAULT false,
  assessment_best_score SMALLINT NOT NULL DEFAULT 0,
  assessment_attempts JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_completion SMALLINT NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_subconcept UNIQUE (user_id, sub_concept_id)
);

-- 4. Student Stats Table: Overall study streak and active curriculum position
CREATE TABLE IF NOT EXISTS public.student_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_days INT NOT NULL DEFAULT 1,
  study_minutes INT NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  last_active_sub_concept_id TEXT DEFAULT 'c8-math-linear-sub2',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Trigger to automatically create a profile on student registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, class_level, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'class_level')::smallint, 8),
    'student' -- Explicitly enforce student role upon registration
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if needed and attach to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Students can only read and update their own data

-- Profiles Policies
DROP POLICY IF EXISTS "Students can view their own profile" ON public.profiles;
CREATE POLICY "Students can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Students can update their own profile" ON public.profiles;
CREATE POLICY "Students can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Students can insert their own profile" ON public.profiles;
CREATE POLICY "Students can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Student Progress Policies
DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
CREATE POLICY "Students can view their own progress"
  ON public.student_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can insert their own progress" ON public.student_progress;
CREATE POLICY "Students can insert their own progress"
  ON public.student_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;
CREATE POLICY "Students can update their own progress"
  ON public.student_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Student Stats Policies
DROP POLICY IF EXISTS "Students can view their own stats" ON public.student_stats;
CREATE POLICY "Students can view their own stats"
  ON public.student_stats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update their own stats" ON public.student_stats;
CREATE POLICY "Students can update their own stats"
  ON public.student_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can insert their own stats" ON public.student_stats;
CREATE POLICY "Students can insert their own stats"
  ON public.student_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.student_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_subconcept ON public.student_progress (sub_concept_id);
