import React, { useState, useEffect } from 'react';
import { X, User, RotateCcw, Check, Sparkles, Trophy, BookOpen, LogOut, Database, Mail, ShieldCheck } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { ClassLevel } from '../../types/curriculum';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupabaseSetup?: () => void;
  onLogout?: () => void;
}

export function ProfileModal({ isOpen, onClose, onOpenSupabaseSetup, onLogout }: ProfileModalProps) {
  const { state, setStudentName, setActiveClass, resetAllProgress, getOverallStats } = useProgress();
  const { student, updateStudentProfile, configStatus, logout } = useStudentAuth();

  const [nameInput, setNameInput] = useState(student?.fullName || state.studentName);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (student) {
      setNameInput(student.fullName);
    } else {
      setNameInput(state.studentName);
    }
  }, [student, state.studentName]);

  if (!isOpen) return null;

  const stats = getOverallStats();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setStudentName(nameInput.trim());
      if (student) {
        await updateStudentProfile({ fullName: nameInput.trim() });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleClassChange = async (c: ClassLevel) => {
    setActiveClass(c);
    if (student) {
      await updateStudentProfile({ classLevel: c });
    }
  };

  const handleSignOut = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Student Profile</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full font-mono">
                {student?.role || 'student'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {student?.email || 'Manage your authenticated learning account'}
            </p>
          </div>
        </div>

        {/* Student Name Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Student Full Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                placeholder="Enter name"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Saved' : 'Update'}</span>
              </button>
            </div>
          </div>

          {/* Email read-only badge */}
          {student && (
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Authenticated Account Email
              </label>
              <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 flex items-center gap-2 font-mono">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{student.email}</span>
                <span className="ml-auto text-[10px] text-emerald-400 font-sans flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          )}

          {/* Active Class Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Enrolled Grade / Class
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {([6, 7, 8, 9, 10] as ClassLevel[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => handleClassChange(c)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    state.currentClass === c
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Class {c}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-4 text-center my-4">
            <div>
              <div className="text-slate-400 text-[11px]">Curriculum Mastery</div>
              <div className="text-xl font-mono font-bold text-cyan-300 mt-0.5">
                {stats.overallPercentage}%
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Assessments Passed</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                {stats.passedAssessmentsCount}
              </div>
            </div>
          </div>

          {/* Backend Info & Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            {onOpenSupabaseSetup && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabaseSetup();
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase: {configStatus.isConfigured ? 'Live' : 'Simulated'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="ml-auto text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
