import React from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  Trophy,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Atom,
  Binary,
  RotateCcw,
  Target,
  ChevronRight
} from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { CURRICULUM_DATA, CLASS_METADATA } from '../../data/curriculumData';
import { ClassLevel, SubjectId } from '../../types/curriculum';

interface StudentDashboardProps {
  onContinueLearning: (conceptId: string, subConceptId: string) => void;
  onNavigateSyllabus: (classLevel: ClassLevel, subjectId: SubjectId) => void;
}

export function StudentDashboard({
  onContinueLearning,
  onNavigateSyllabus
}: StudentDashboardProps) {
  const {
    state,
    calculateSubConceptCompletion,
    getOverallStats,
    getSubjectProgressPercentage,
    resetAllProgress,
    setActiveClass
  } = useProgress();

  const stats = getOverallStats();

  // Find last active sub-concept and its parent concept
  let activeSubConcept = null;
  let activeParentConcept = null;

  for (const c of CURRICULUM_DATA) {
    const found = c.subConcepts.find((sc) => sc.id === state.lastActiveSubConceptId);
    if (found) {
      activeSubConcept = found;
      activeParentConcept = c;
      break;
    }
  }

  // Fallback to Class 8 Linear Equations Sub-concept 2 if none found
  if (!activeSubConcept) {
    activeParentConcept = CURRICULUM_DATA[0];
    activeSubConcept = CURRICULUM_DATA[0].subConcepts[1];
  }

  const activeProgress = activeSubConcept
    ? state.progressBySubConcept[activeSubConcept.id]
    : undefined;
  const activeCompletion = calculateSubConceptCompletion(activeProgress);

  // Collect recent assessments
  const recentAttempts: {
    title: string;
    score: number;
    passed: boolean;
    timestamp: number;
  }[] = [];

  CURRICULUM_DATA.forEach((concept) => {
    concept.subConcepts.forEach((sc) => {
      const p = state.progressBySubConcept[sc.id];
      if (p && p.assessmentAttempts.length > 0) {
        const lastAttempt = p.assessmentAttempts[p.assessmentAttempts.length - 1];
        recentAttempts.push({
          title: sc.title,
          score: lastAttempt.score,
          passed: lastAttempt.passed,
          timestamp: lastAttempt.timestamp
        });
      }
    });
  });

  recentAttempts.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Student Welcome Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#2563EB] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Student Learning Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
              Welcome back, {state.studentName}!
            </h1>
            <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
              You are currently enrolled in <strong className="text-[#111827]">Class {state.currentClass}</strong>. Keep up your momentum to reach the 80% mastery threshold across Science and Mathematics!
            </p>

            {/* Quick Class Switcher */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-[#64748B] font-semibold">Active Class:</span>
              {[6, 7, 8, 9, 10].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveClass(lvl as ClassLevel)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    state.currentClass === lvl
                      ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                      : 'bg-[#F8FAFF] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5FF]'
                  }`}
                >
                  Class {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Streak & Study Goals Card */}
          <div className="flex items-center gap-4 bg-[#F8FAFF] border border-[#BFDBFE] p-4 rounded-2xl self-start lg:self-center shrink-0 shadow-sm">
            <div className="flex items-center gap-3 pr-4 border-r border-[#E2E8F0]">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-lg font-mono font-bold text-[#111827]">
                  {state.streakDays} Days
                </div>
                <div className="text-[11px] text-[#64748B]">Learning Streak</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-mono font-bold text-[#111827]">85%</div>
                <div className="text-[11px] text-[#64748B]">Weekly Goal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary "Continue Learning" Hero Card */}
      {activeParentConcept && activeSubConcept && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Resume Your Active Lesson</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
                {activeSubConcept.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
                {activeParentConcept.title} · Class {activeParentConcept.classLevel}{' '}
                <span className="capitalize">{activeParentConcept.subjectId}</span>
              </p>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5">
                  <span>Current Sub-concept Progress:</span>
                  <span className="font-mono font-bold text-[#2563EB]">
                    {activeCompletion}% / 100%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#DBEAFE] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                    style={{ width: `${activeCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onContinueLearning(activeParentConcept!.id, activeSubConcept!.id)
              }
              className="btn-primary px-6 py-3.5 font-semibold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 group self-start md:self-center cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Completion Ring */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E2E8F0]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#2563EB]"
                strokeDasharray={`${stats.overallPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-xs font-bold font-mono text-[#111827]">
              {stats.overallPercentage}%
            </div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Total Curriculum</div>
            <div className="text-base font-bold text-[#111827] mt-0.5">Overall Mastery</div>
          </div>
        </div>

        {/* Mathematics Progress */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Mathematics</div>
            <div className="text-lg font-mono font-bold text-[#111827] mt-0.5">
              {stats.mathPercentage}%
            </div>
          </div>
        </div>

        {/* Science Progress */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0284C7] shrink-0">
            <Atom className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Science</div>
            <div className="text-lg font-mono font-bold text-[#111827] mt-0.5">
              {stats.sciencePercentage}%
            </div>
          </div>
        </div>

        {/* Assessments Passed */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Assessments Passed</div>
            <div className="text-lg font-mono font-bold text-[#111827] mt-0.5">
              {stats.passedAssessmentsCount} Quizzes (≥80%)
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Split: Subject Paths & Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Class Subject Launchers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2563EB]" />
            <span>Class {state.currentClass} Disciplines</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Math Card */}
            <div
              onClick={() => onNavigateSyllabus(state.currentClass, 'mathematics')}
              className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Binary className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#2563EB]">
                    {getSubjectProgressPercentage(state.currentClass, 'mathematics')}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                  Mathematics
                </h4>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Linear equations, rational numbers, quadrilaterals, squares, and quadratic equations.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#EDF2F7] text-xs font-semibold text-[#2563EB]">
                <span>Browse Syllabus</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Science Card */}
            <div
              onClick={() => onNavigateSyllabus(state.currentClass, 'science')}
              className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center">
                    <Atom className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#2563EB]">
                    {getSubjectProgressPercentage(state.currentClass, 'science')}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                  Science
                </h4>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Light optics, force and pressure, plant anatomy, sound waves, and electric circuits.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#EDF2F7] text-xs font-semibold text-[#2563EB]">
                <span>Browse Syllabus</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Reset Demo Progress tool */}
          <div className="pt-4 flex items-center justify-between text-xs text-[#64748B]">
            <span>Learning progress is saved automatically to your profile session.</span>
            <button
              onClick={resetAllProgress}
              className="text-[#64748B] hover:text-[#DC2626] transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Assessment Activity */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D97706]" />
            <span>Mastery Scoreboard</span>
          </h3>

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 space-y-3 shadow-sm">
            {recentAttempts.length > 0 ? (
              recentAttempts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-[200px]">
                    <div className="font-semibold text-[#111827] truncate">{item.title}</div>
                    <div className="text-[11px] text-[#64748B]">
                      {item.passed ? 'Unlocked next sub-concept' : 'Needs revision (<80%)'}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm ${
                        item.passed ? 'text-[#16A34A]' : 'text-[#D97706]'
                      }`}
                    >
                      {item.score}%
                    </span>
                    <div
                      className={`text-[10px] font-bold ${
                        item.passed ? 'text-[#16A34A]' : 'text-[#D97706]'
                      }`}
                    >
                      {item.passed ? 'PASSED' : 'RETRY'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#64748B]">
                No assessments taken yet. Start a lesson to take your first evaluation!
              </div>
            )}

            {/* Recommendation Box */}
            <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#475569] space-y-1">
              <div className="font-bold text-[#2563EB]">Recommended Next Step:</div>
              <p>
                Complete the interactive Balance Scale simulation in <strong>Class 8 Mathematics: Linear Equations</strong> to unlock Step 3!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
