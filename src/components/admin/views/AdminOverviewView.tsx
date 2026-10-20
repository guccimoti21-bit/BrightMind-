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
  Atom,
  ExternalLink
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
  totalChapterQuizzes?: number;
  activeChapterQuizzes?: number;
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
      <div className="py-20 text-center text-xs text-[#64748B]">
        Loading administrator portal metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#BFDBFE] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Educational Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
            Manage Classes 6 to 10 curricula, live interactive simulations, assessment question banks, and the 80% sequential unlocking rules. Changes appear live on the front page index.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={() => onNavigateSection('lesson-editor')}
            className="btn-primary px-4 py-2.5 font-semibold text-xs flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Create New Lesson</span>
          </button>
          <button
            onClick={() => onNavigateSection('questions')}
            className="btn-secondary px-4 py-2.5 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-[#2563EB]" />
            <span>Manage Questions</span>
          </button>
        </div>
      </div>

      {/* 8 Essential CMS Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes */}
        <div
          onClick={() => onNavigateSection('classes')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Classes Managed</span>
            <Layers className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#111827] group-hover:text-[#2563EB]">
            {stats.totalClasses}
          </div>
          <div className="text-[11px] text-[#64748B]">Grades 6, 7, 8, 9, 10</div>
        </div>

        {/* Subjects */}
        <div
          onClick={() => onNavigateSection('subjects')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Core Disciplines</span>
            <Atom className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#111827] group-hover:text-[#2563EB]">
            {stats.totalSubjects}
          </div>
          <div className="text-[11px] text-[#64748B]">Science &amp; Mathematics</div>
        </div>

        {/* Chapters */}
        <div
          onClick={() => onNavigateSection('concepts')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Chapters / Concepts</span>
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#111827] group-hover:text-[#2563EB]">
            {stats.totalConcepts}
          </div>
          <div className="text-[11px] text-[#64748B]">Active curriculum units</div>
        </div>

        {/* Sub-concepts */}
        <div
          onClick={() => onNavigateSection('subconcepts')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Sub-concepts</span>
            <FileText className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#111827] group-hover:text-[#2563EB]">
            {stats.totalSubConcepts}
          </div>
          <div className="text-[11px] text-[#64748B]">Step-by-step topics</div>
        </div>

        {/* Published Lessons */}
        <div
          onClick={() => onNavigateSection('concepts')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Published Lessons</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#16A34A]">
            {stats.publishedLessons}
          </div>
          <div className="text-[11px] text-[#64748B]">Live for students</div>
        </div>

        {/* Draft Lessons */}
        <div
          onClick={() => onNavigateSection('concepts')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Draft Lessons</span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#D97706]">
            {stats.draftLessons}
          </div>
          <div className="text-[11px] text-[#64748B]">Awaiting publication</div>
        </div>

        {/* Question Bank */}
        <div
          onClick={() => onNavigateSection('questions')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Question Bank</span>
            <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#111827] group-hover:text-[#2563EB]">
            {stats.totalQuestions}
          </div>
          <div className="text-[11px] text-[#64748B]">Assessment items</div>
        </div>

        {/* Media Items */}
        <div
          onClick={() => onNavigateSection('media')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Media Library</span>
            <ImageIcon className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#111827] group-hover:text-[#2563EB]">
            {stats.totalMedia}
          </div>
          <div className="text-[11px] text-[#64748B]">Illustrations &amp; assets</div>
        </div>

        {/* External Quiz Links */}
        <div
          onClick={() => onNavigateSection('chapter-quizzes')}
          className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all space-y-1 group shadow-sm col-span-2 lg:col-span-4"
        >
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-bold text-[#111827]">External Chapter Quiz Links</span>
            <ExternalLink className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-[#111827] group-hover:text-[#2563EB]">
                {stats.totalChapterQuizzes ?? 0}
              </span>
              <span className="text-xs text-[#16A34A] font-semibold">
                ({stats.activeChapterQuizzes ?? 0} active)
              </span>
            </div>
            <span className="text-xs text-[#2563EB] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Manage Chapter Quizzes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-[#64748B]">
            Assign interactive Quizizz, Kahoot, Google Forms, and Wordwall tests for every Science &amp; Math chapter.
          </div>
        </div>
      </div>
    </div>
  );
}
