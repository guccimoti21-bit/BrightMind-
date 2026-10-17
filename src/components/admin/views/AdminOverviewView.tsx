import React, { useEffect, useState } from 'react';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Binary,
  Atom
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

interface AdminStats {
  totalClasses: number;
  totalSubjects: number;
  totalConcepts: number;
  totalSubConcepts: number;
  publishedLessons: number;
  draftLessons: number;
  totalQuestions: number;
  totalMedia: number;
  recentAuditLogs: {
    id: string;
    timestamp: number;
    adminUsername: string;
    category: string;
    action: string;
    details: string;
  }[];
}

interface AdminOverviewViewProps {
  onNavigateSection: (section: string) => void;
}

export function AdminOverviewView({ onNavigateSection }: AdminOverviewViewProps) {
  const { token, admin } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Error fetching admin stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [token]);

  if (loading || !stats) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading administrator portal metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Educational Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage Classes 6 to 10 curricula, live interactive simulations, assessment question banks, and the 80% sequential unlocking rules.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={() => onNavigateSection('lesson-editor')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Create New Lesson</span>
          </button>
          <button
            onClick={() => onNavigateSection('questions')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Manage Questions</span>
          </button>
        </div>
      </div>

      {/* 8 Essential CMS Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes */}
        <div
          onClick={() => onNavigateSection('classes')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Classes Managed</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white group-hover:text-cyan-300">
            {stats.totalClasses}
          </div>
          <div className="text-[11px] text-slate-400">Grades 6, 7, 8, 9, 10</div>
        </div>

        {/* Subjects */}
        <div
          onClick={() => onNavigateSection('subjects')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Core Disciplines</span>
            <Atom className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white group-hover:text-cyan-300">
            {stats.totalSubjects}
          </div>
          <div className="text-[11px] text-slate-400">Science &amp; Mathematics</div>
        </div>

        {/* Chapters */}
        <div
          onClick={() => onNavigateSection('concepts')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Chapters</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white group-hover:text-cyan-300">
            {stats.totalConcepts}
          </div>
          <div className="text-[11px] text-slate-400">NCERT / CBSE Aligned</div>
        </div>

        {/* Sub-Concepts */}
        <div
          onClick={() => onNavigateSection('subconcepts')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Sub-concepts</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white group-hover:text-cyan-300">
            {stats.totalSubConcepts}
          </div>
          <div className="text-[11px] text-slate-400">Modular 20m Units</div>
        </div>

        {/* Published Lessons */}
        <div
          onClick={() => onNavigateSection('concepts')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Published Chapters</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {stats.publishedLessons}
          </div>
          <div className="text-[11px] text-slate-400">Visible to Students</div>
        </div>

        {/* Draft Lessons */}
        <div
          onClick={() => onNavigateSection('concepts')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Draft Content</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">
            {stats.draftLessons}
          </div>
          <div className="text-[11px] text-slate-400">Hidden until Published</div>
        </div>

        {/* Questions Bank */}
        <div
          onClick={() => onNavigateSection('questions')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>MCQ Question Bank</span>
            <HelpCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white group-hover:text-cyan-300">
            {stats.totalQuestions}
          </div>
          <div className="text-[11px] text-slate-400">Graded Evaluations</div>
        </div>

        {/* Media Assets */}
        <div
          onClick={() => onNavigateSection('media')}
          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Media Library</span>
            <ImageIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white group-hover:text-cyan-300">
            {stats.totalMedia}
          </div>
          <div className="text-[11px] text-slate-400">Diagrams &amp; Illustrations</div>
        </div>
      </div>

      {/* Two-Column: Quick Operations & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Actions Grid (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Essential Administrative Workflows</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateSection('rules')}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all space-y-1 group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                <span>80% Unlocking Rules</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adjust completion weights (30/20/20/30) and passing criteria.
              </p>
            </button>

            <button
              onClick={() => onNavigateSection('appearance')}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all space-y-1 group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                <span>Homepage Copy &amp; Hero</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Customize titles, announcement banners, and featured chapters.
              </p>
            </button>

            <button
              onClick={() => onNavigateSection('activities')}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all space-y-1 group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                <span>Simulations &amp; Activities</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Test and configure Balance Scales, Ray Optics, and Number Lines.
              </p>
            </button>

            <button
              onClick={() => onNavigateSection('security')}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all space-y-1 group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                <span>Account &amp; Security</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Change master administrator password and review active tokens.
              </p>
            </button>
          </div>
        </div>

        {/* Right: Security & Audit Activity Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Audit Logs</span>
            </h3>
            <button
              onClick={() => onNavigateSection('audit-logs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All Logs
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
            {stats.recentAuditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{log.action}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    {log.adminUsername}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
