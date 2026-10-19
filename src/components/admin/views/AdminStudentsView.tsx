import React, { useState } from 'react';
import { Users, RotateCcw, CheckCircle2, Trophy, Clock, Search, BookOpen } from 'lucide-react';
import { useProgress } from '../../../context/ProgressContext';
import { CURRICULUM_DATA } from '../../../data/curriculumData';

export function AdminStudentsView() {
  const { state, resetAllProgress, calculateSubConceptCompletion } = useProgress();
  const [resetStatus, setResetStatus] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Student Progress &amp; Accounts</h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Monitor registered learner progress, assessment attempts, and completion records.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Student Session</span>
        </button>
      </div>

      {resetStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetStatus}</span>
        </div>
      )}

      {/* Student Profile Card */}
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
