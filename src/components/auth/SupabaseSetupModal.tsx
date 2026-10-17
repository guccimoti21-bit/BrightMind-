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
    const sql = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  class_level SMALLINT NOT NULL DEFAULT 8,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sub_concept_id TEXT NOT NULL,
  lesson_completed BOOLEAN DEFAULT false,
  activity_completed BOOLEAN DEFAULT false,
  practice_completed BOOLEAN DEFAULT false,
  assessment_passed BOOLEAN DEFAULT false,
  assessment_best_score SMALLINT DEFAULT 0,
  overall_completion SMALLINT DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  last_visited_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_subconcept UNIQUE (user_id, sub_concept_id)
);

CREATE TABLE IF NOT EXISTS public.student_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_days INT DEFAULT 1,
  study_minutes INT DEFAULT 0,
  last_active_sub_concept_id TEXT DEFAULT 'c8-math-linear-sub2'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Students own progress" ON public.student_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Students own stats" ON public.student_stats FOR ALL USING (auth.uid() = user_id);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Supabase Integration &amp; Config</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold ${
                  configStatus.isConfigured
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                }`}
              >
                {configStatus.isConfigured ? 'Live Supabase Connected' : 'Simulated Backend Active'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Configure your Supabase project for persistent student auth and progress tracking
            </p>
          </div>
        </div>

        {/* Current Mode Description */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Current Backend Engine:</span>
            <span className="text-cyan-400 font-mono">
              {configStatus.isConfigured ? 'Remote Supabase Project' : 'In-Memory / Local Storage Simulator'}
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            {configStatus.isConfigured
              ? 'Your application is connected to a live Supabase instance. Student registrations, passwords, and progress tables are synced via Supabase client.'
              : 'BrightMind Learning includes an embedded Supabase-compatible client simulator so student accounts, sign-in, progress persistence, and 80% mastery unlocking work right away without setup.'}
          </p>
        </div>

        {/* Custom Supabase Keys Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Supabase Credentials
          </h4>
          <p className="text-xs text-slate-400">
            You can define these in <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">.env</code> or test directly below:
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supabase Project URL (<code>VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supabase Anonymous Key (<code>VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved & Reconnected' : 'Save & Connect'}</span>
            </button>

            {configStatus.isConfigured && (
              <button
                type="button"
                onClick={handleResetToSimulated}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Switch Back to Simulated Mode
              </button>
            )}
          </div>
        </form>

        {/* SQL Schema Instructions */}
        <div className="border-t border-slate-800 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Supabase Database SQL Schema
            </h4>
            <button
              onClick={copySqlSnippet}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'SQL Copied!' : 'Copy Schema Script'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            A full migration file is saved at <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">/supabase-schema.sql</code>. Paste it into your Supabase Dashboard &gt; SQL Editor to generate the <code className="text-slate-300">profiles</code>, <code className="text-slate-300">student_progress</code>, and <code className="text-slate-300">student_stats</code> tables with Row Level Security.
          </p>
        </div>
      </div>
    </div>
  );
}
