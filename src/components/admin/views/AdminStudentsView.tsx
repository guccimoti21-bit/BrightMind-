import React, { useState, useEffect } from 'react';
import {
  Users,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Clock,
  Search,
  BookOpen,
  GraduationCap,
  Mail,
  Calendar,
  Shield,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useProgress } from '../../../context/ProgressContext';
import { CURRICULUM_DATA } from '../../../data/curriculumData';
import { getSupabase, isSupabaseLiveConfigured } from '../../../lib/supabase';

interface RegisteredProfile {
  id: string;
  email: string;
  full_name: string;
  class_level: number;
  role: string;
  created_at: string;
}

export function AdminStudentsView() {
  const { state, resetAllProgress, calculateSubConceptCompletion } = useProgress();
  const [resetStatus, setResetStatus] = useState('');

  // Supabase profiles state
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<'all' | number>('all');

  const isLiveSupabase = isSupabaseLiveConfigured();

  const loadRegisteredProfiles = async () => {
    if (!isLiveSupabase) return;
    try {
      setLoadingProfiles(true);
      setProfilesError(null);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, class_level, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setProfilesError(error.message);
      } else if (data) {
        setRegisteredStudents(data);
      }
    } catch (err: any) {
      setProfilesError(err.message || 'Failed to query student profiles.');
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    loadRegisteredProfiles();
  }, [isLiveSupabase]);

  const completedCount = Object.values(state.progressBySubConcept).filter(
    (p) => p.isCompleted
  ).length;

  const handleReset = () => {
    if (window.confirm(`Reset progress records for student "${state.studentName}"?`)) {
      resetAllProgress();
      setResetStatus('Student progress reset to baseline demo state.');
      setTimeout(() => setResetStatus(''), 2500);
    }
  };

  const filteredStudents = registeredStudents.filter((student) => {
    const matchesSearch =
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClassFilter === 'all' || student.class_level === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Student Progress &amp; Accounts</h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Monitor registered learner profiles, class selections (Classes 6–10), and curriculum progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLiveSupabase && (
            <button
              onClick={loadRegisteredProfiles}
              disabled={loadingProfiles}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProfiles ? 'animate-spin' : ''}`} />
              <span>Refresh Profiles</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Student Session</span>
          </button>
        </div>
      </div>

      {resetStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetStatus}</span>
        </div>
      )}

      {/* Cloud Supabase Registered Profiles Section */}
      {isLiveSupabase && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF2F7]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#111827]">
                Registered Cloud Accounts ({registeredStudents.length})
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="all">All Classes</option>
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
              </select>
            </div>
          </div>

          {profilesError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{profilesError}</span>
            </div>
          )}

          {loadingProfiles ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading registered accounts from Supabase...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No registered accounts found matching the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2 font-semibold">User</th>
                    <th className="py-2 font-semibold">Email</th>
                    <th className="py-2 font-semibold">Enrolled Class</th>
                    <th className="py-2 font-semibold">Role</th>
                    <th className="py-2 font-semibold">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-medium text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                          {s.full_name?.charAt(0) || 'U'}
                        </div>
                        <span>{s.full_name || 'Unnamed'}</span>
                      </td>
                      <td className="py-2.5 text-slate-600 font-mono text-[11px]">{s.email}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100">
                          <GraduationCap className="w-3 h-3" />
                          Class {s.class_level}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wide border ${
                            s.role === 'admin'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Active Student Session Card */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center font-bold text-lg font-mono">
              {state.studentName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827]">{state.studentName}</h3>
              <p className="text-xs text-[#475569]">
                Enrolled: <strong className="text-[#2563EB]">Class {state.currentClass}</strong> · Active Streak: <strong className="text-[#D97706]">{state.streakDays} Days</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-3 bg-[#F8FAFF] rounded-xl border border-[#E2E8F0] text-center">
              <span className="text-[#64748B] text-[10px] block">Completed Units</span>
              <span className="text-[#16A34A] font-bold text-base">{completedCount}</span>
            </div>
            <div className="p-3 bg-[#F8FAFF] rounded-xl border border-[#E2E8F0] text-center">
              <span className="text-[#64748B] text-[10px] block">Study Time</span>
              <span className="text-[#2563EB] font-bold text-base">{state.studyMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Detailed Progress Table */}
        <div className="pt-4 border-t border-[#EDF2F7] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
            Active Sub-Concept Record
          </h4>

          <div className="divide-y divide-[#EDF2F7] text-xs">
            {Object.entries(state.progressBySubConcept).map(([subId, p]) => {
              const completion = calculateSubConceptCompletion(p);

              return (
                <div key={subId} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[#2563EB] font-bold">{subId}</span>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                      <span>Lesson: {p.lessonCompleted ? '✓' : '—'}</span>
                      <span>·</span>
                      <span>Activity: {p.activityCompleted ? '✓' : '—'}</span>
                      <span>·</span>
                      <span>Practice: {p.practiceCompleted ? '✓' : '—'}</span>
                      <span>·</span>
                      <span>Quiz Passed: {p.assessmentPassed ? '✓' : '—'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[#111827] text-sm">{completion}%</span>
                    <div
                      className={`text-[10px] font-bold ${
                        p.isCompleted ? 'text-[#16A34A]' : 'text-[#2563EB]'
                      }`}
                    >
                      {p.isCompleted ? 'COMPLETED (≥80%)' : 'IN PROGRESS'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
