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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5FF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <span>Student Profile</span>
              <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded-full font-mono font-bold">
                {student?.role || 'student'}
              </span>
            </h3>
            <p className="text-xs text-[#64748B]">
              {student?.email || 'Manage your authenticated learning account'}
            </p>
          </div>
        </div>

        {/* Student Name Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
              Student Full Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB]"
                placeholder="Enter name"
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Saved' : 'Update'}</span>
              </button>
            </div>
          </div>

          {/* Email read-only badge */}
          {student && (
            <div>
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1">
                Account Email
              </label>
              <div className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#475569] flex items-center gap-2 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span className="truncate">{student.email}</span>
                <span className="ml-auto text-[10px] text-[#16A34A] font-sans flex items-center gap-1 shrink-0 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          )}

          {/* Active Class Selection */}
          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
              Enrolled Grade / Class
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {([6, 7, 8, 9, 10] as ClassLevel[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => handleClassChange(c)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    state.currentClass === c
                      ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                      : 'bg-[#F8FAFF] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5FF]'
                  }`}
                >
                  Class {c}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-semibold text-[#111827] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Current Session Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B]">Curriculum Mastery</div>
                <div className="text-sm font-bold font-mono text-[#2563EB]">
                  {stats.overallPercentage}%
                </div>
              </div>
              <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B]">Assessments Passed</div>
                <div className="text-sm font-bold font-mono text-[#16A34A]">
                  {stats.passedAssessmentsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={resetAllProgress}
              className="text-xs text-[#DC2626] hover:text-[#991B1B] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Local Progress</span>
            </button>

            {student && (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-semibold text-[#DC2626] hover:text-[#991B1B] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
