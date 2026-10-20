import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { getStoredSupabaseConfig, saveCustomSupabaseConfig, isSupabaseLiveConfigured } from '../../lib/supabase';
import { useStudentAuth } from '../../context/StudentAuthContext';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseSetupModal({ isOpen, onClose }: SupabaseSetupModalProps) {
  const { reloadConfig, configStatus } = useStudentAuth();
  const currentConfig = getStoredSupabaseConfig();

  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(url, anonKey);
    reloadConfig();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetToSimulated = () => {
    setUrl('');
    setAnonKey('');
    saveCustomSupabaseConfig('', '');
    reloadConfig();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copySqlSnippet = () => {
    const sql = `-- SciMathenova Database Schema & Administrator Bootstrap
-- See /supabase-schema.sql for the complete migration.
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/sjlmhdckpshyqeqihjgr/sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'super_admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  class_level SMALLINT NOT NULL DEFAULT 8 CHECK (class_level BETWEEN 6 AND 10),
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

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
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

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
  time_limit_minutes INT,
  question_count INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sub_concept_id TEXT NOT NULL,
  concept_id TEXT,
  lesson_completed BOOLEAN DEFAULT false,
  activity_completed BOOLEAN DEFAULT false,
  practice_completed BOOLEAN DEFAULT false,
  assessment_passed BOOLEAN DEFAULT false,
  assessment_best_score SMALLINT DEFAULT 0 CHECK (assessment_best_score BETWEEN 0 AND 100),
  assessment_attempts JSONB DEFAULT '[]'::jsonb,
  overall_completion SMALLINT DEFAULT 0 CHECK (overall_completion BETWEEN 0 AND 100),
  is_unlocked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  last_visited_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_subconcept UNIQUE (user_id, sub_concept_id)
);

CREATE TABLE IF NOT EXISTS public.student_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_days INT DEFAULT 1,
  study_minutes INT DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  last_active_sub_concept_id TEXT DEFAULT 'c8-math-linear-sub2',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin') THEN RETURN true; END IF;
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "chapters_select_policy" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "chapters_admin_all" ON public.chapters FOR ALL USING (public.is_admin());

CREATE POLICY "quizzes_select_policy" ON public.chapter_quizzes FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "quizzes_admin_all" ON public.chapter_quizzes FOR ALL USING (public.is_admin());

CREATE POLICY "progress_select_policy" ON public.student_progress FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "progress_insert_policy" ON public.student_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update_policy" ON public.student_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_delete_policy" ON public.student_progress FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "stats_select_policy" ON public.student_stats FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "stats_insert_policy" ON public.student_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stats_update_policy" ON public.student_stats FOR UPDATE USING (auth.uid() = user_id);

-- To promote an administrator:
-- SELECT public.bootstrap_admin_account('your-email@example.com');
-- Or: UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-[#111827]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5FF] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <span>Supabase Integration &amp; Config</span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-semibold ${
                  configStatus.isConfigured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {configStatus.isConfigured ? 'Live Supabase Connected' : 'Simulated Backend Active'}
              </span>
            </h3>
            <p className="text-xs text-[#475569]">
              Configure your Supabase project for persistent student auth and progress tracking
            </p>
          </div>
        </div>

        {/* Current Mode Description */}
        <div className="p-4 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] text-xs space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#111827]">Current Backend Engine:</span>
            <span className="text-[#2563EB] font-mono font-semibold">
              {configStatus.isConfigured ? 'Remote Supabase Project' : 'In-Memory / Local Storage Simulator'}
            </span>
          </div>
          <p className="text-[#475569] leading-relaxed">
            {configStatus.isConfigured
              ? 'Your application is connected to a live Supabase instance. Student registrations, passwords, and progress tables are synced via Supabase client.'
              : 'SciMathenova includes an embedded Supabase-compatible client simulator so student accounts, sign-in, progress persistence, and 80% mastery unlocking work right away without setup.'}
          </p>
        </div>

        {/* Custom Supabase Keys Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
            Live Supabase Credentials
          </h4>
          <p className="text-xs text-[#475569]">
            You can define these in <code className="text-[#2563EB] bg-[#EFF6FF] px-1 py-0.5 rounded border border-[#BFDBFE]">.env</code> or test directly below:
          </p>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">
              Supabase Project URL (<code>VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">
              Supabase Anonymous Key (<code>VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved & Reconnected' : 'Save & Connect'}</span>
            </button>

            {configStatus.isConfigured && (
              <button
                type="button"
                onClick={handleResetToSimulated}
                className="btn-secondary px-3 py-2 text-xs font-medium cursor-pointer"
              >
                Switch Back to Simulated Mode
              </button>
            )}
          </div>
        </form>

        {/* SQL Schema Instructions */}
        <div className="border-t border-[#E2E8F0] pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Supabase Database SQL Schema
            </h4>
            <button
              onClick={copySqlSnippet}
              className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'SQL Copied!' : 'Copy Schema Script'}</span>
            </button>
          </div>
          <p className="text-xs text-[#475569]">
            A full migration file is saved at <code className="text-[#2563EB] bg-[#EFF6FF] px-1 py-0.5 rounded border border-[#BFDBFE]">/supabase-schema.sql</code>. Paste it into your Supabase Dashboard &gt; SQL Editor to generate the <code className="text-[#111827] font-semibold">profiles</code>, <code className="text-[#111827] font-semibold">student_progress</code>, and <code className="text-[#111827] font-semibold">student_stats</code> tables with Row Level Security.
          </p>
        </div>
      </div>
    </div>
  );
}
