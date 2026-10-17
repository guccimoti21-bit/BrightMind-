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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Student Progress &amp; Accounts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor registered learner progress, assessment attempts, and completion records.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/60 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Student Session</span>
        </button>
      </div>

      {resetStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{resetStatus}</span>
        </div>
      )}

      {/* Student Profile Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-cyan-400 flex items-center justify-center font-bold text-lg font-mono">
              {state.studentName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{state.studentName}</h3>
              <p className="text-xs text-slate-400">
                Enrolled: <strong className="text-cyan-300">Class {state.currentClass}</strong> · Active Streak: <strong className="text-amber-400">{state.streakDays} Days</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Completed Units</span>
              <span className="text-emerald-400 font-bold text-base">{completedCount}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Study Time</span>
              <span className="text-cyan-400 font-bold text-base">{state.studyMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Detailed Progress Table */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Sub-Concept Record
          </h4>

          <div className="divide-y divide-slate-800/80 text-xs">
            {Object.entries(state.progressBySubConcept).map(([subId, p]) => {
              const completion = calculateSubConceptCompletion(p);

              return (
                <div key={subId} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-cyan-300 font-bold">{subId}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
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
                    <span className="font-mono font-bold text-white text-sm">{completion}%</span>
                    <div
                      className={`text-[10px] font-bold ${
                        p.isCompleted ? 'text-emerald-400' : 'text-cyan-400'
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
