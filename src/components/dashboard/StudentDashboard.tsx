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
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Student Learning Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {state.studentName}!
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              You are currently enrolled in <strong className="text-white">Class {state.currentClass}</strong>. Keep up your momentum to reach the 80% mastery threshold across Science and Mathematics!
            </p>

            {/* Quick Class Switcher */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-slate-400">Class:</span>
              {[6, 7, 8, 9, 10].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveClass(lvl as ClassLevel)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                    state.currentClass === lvl
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}th
                </button>
              ))}
            </div>
          </div>

          {/* Streak & Study Goals Card */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl self-start lg:self-center shrink-0">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-lg font-mono font-bold text-white">
                  {state.streakDays} Days
                </div>
                <div className="text-[11px] text-slate-400">Learning Streak</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-mono font-bold text-white">85%</div>
                <div className="text-[11px] text-slate-400">Weekly Goal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary "Continue Learning" Hero Card */}
      {activeParentConcept && activeSubConcept && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Resume Your Active Lesson</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {activeSubConcept.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {activeParentConcept.title} · Class {activeParentConcept.classLevel}{' '}
                <span className="capitalize">{activeParentConcept.subjectId}</span>
              </p>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Current Sub-concept Progress:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {activeCompletion}% / 100%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${activeCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onContinueLearning(activeParentConcept!.id, activeSubConcept!.id)
              }
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 group self-start md:self-center"
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
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray={`${stats.overallPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-xs font-bold font-mono text-white">
              {stats.overallPercentage}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Curriculum</div>
            <div className="text-base font-bold text-white mt-0.5">Overall Mastery</div>
          </div>
        </div>

        {/* Mathematics Progress */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Mathematics</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">
              {stats.mathPercentage}%
            </div>
          </div>
        </div>

        {/* Science Progress */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Atom className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Science</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">
              {stats.sciencePercentage}%
            </div>
          </div>
        </div>

        {/* Assessments Passed */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Assessments Passed</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">
              {stats.passedAssessmentsCount} Quizzes (≥80%)
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Split: Subject Paths & Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Class Subject Launchers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Class {state.currentClass} Disciplines</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Math Card */}
            <div
              onClick={() => onNavigateSyllabus(state.currentClass, 'mathematics')}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Binary className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {getSubjectProgressPercentage(state.currentClass, 'mathematics')}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Mathematics
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Linear equations, rational numbers, quadrilaterals, squares, and statistics.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 text-xs font-semibold text-blue-400 group-hover:text-cyan-300">
                <span>Browse Syllabus</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Science Card */}
            <div
              onClick={() => onNavigateSyllabus(state.currentClass, 'science')}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                    <Atom className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {getSubjectProgressPercentage(state.currentClass, 'science')}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Science
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Light optics, force and pressure, sound waves, microorganisms, and combustion.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 text-xs font-semibold text-purple-400 group-hover:text-cyan-300">
                <span>Browse Syllabus</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Reset Demo Progress tool for evaluator convenience */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Prototype state is stored locally in your browser session.</span>
            <button
              onClick={resetAllProgress}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Assessment Activity & Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Mastery Scoreboard</span>
          </h3>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            {recentAttempts.length > 0 ? (
              recentAttempts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-[200px]">
                    <div className="font-semibold text-white truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.passed ? 'Unlocked next sub-concept' : 'Needs revision (<80%)'}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm ${
                        item.passed ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {item.score}%
                    </span>
                    <div
                      className={`text-[10px] font-bold ${
                        item.passed ? 'text-emerald-300' : 'text-amber-300'
                      }`}
                    >
                      {item.passed ? 'PASSED' : 'RETRY'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No assessments taken yet. Start a lesson to take your first evaluation!
              </div>
            )}

            {/* Recommendation Box */}
            <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-900/60 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-cyan-300">Recommended Next Step:</div>
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
