import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileText,
  Trophy,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  Scale,
  RefreshCw
} from 'lucide-react';
import { SubConcept, Concept } from '../../types/curriculum';
import { useProgress } from '../../context/ProgressContext';
import { BalanceScaleActivity } from '../activities/BalanceScaleActivity';
import { RayOpticsActivity } from '../activities/RayOpticsActivity';
import { NumberLineActivity } from '../activities/NumberLineActivity';
import { AssessmentComponent } from '../assessment/AssessmentComponent';

interface LessonViewProps {
  concept: Concept;
  subConcept: SubConcept;
  onBackToConcepts: () => void;
  onNavigateSubConcept: (subConceptId: string) => void;
}

type TabType = 'explanation' | 'activity' | 'examples' | 'practice' | 'revision' | 'assessment';

export function LessonView({
  concept,
  subConcept,
  onBackToConcepts,
  onNavigateSubConcept
}: LessonViewProps) {
  const {
    state,
    calculateSubConceptCompletion,
    isSubConceptUnlocked,
    markLessonComplete,
    markActivityComplete,
    markPracticeComplete
  } = useProgress();

  const [activeTab, setActiveTab] = useState<TabType>('explanation');
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [showPracticeHints, setShowPracticeHints] = useState<Record<string, boolean>>({});

  const progress = state.progressBySubConcept[subConcept.id];
  const overallPercentage = calculateSubConceptCompletion(progress);

  // Sub-concept indices for previous / next navigation
  const currentIndex = concept.subConcepts.findIndex((sc) => sc.id === subConcept.id);
  const prevSubConcept = currentIndex > 0 ? concept.subConcepts[currentIndex - 1] : null;
  const nextSubConcept =
    currentIndex < concept.subConcepts.length - 1 ? concept.subConcepts[currentIndex + 1] : null;

  const isNextUnlocked = nextSubConcept ? isSubConceptUnlocked(concept.id, nextSubConcept.id) : false;

  const handlePracticeSelect = (qId: string, optIndex: number, correctIndex: number) => {
    setPracticeAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    if (optIndex === correctIndex) {
      markPracticeComplete(subConcept.id);
    }
  };

  const renderActivity = () => {
    if (subConcept.activity.type === 'balance-scale') {
      return (
        <BalanceScaleActivity
          onComplete={() => markActivityComplete(subConcept.id)}
          isAlreadyCompleted={progress?.activityCompleted}
        />
      );
    }
    if (subConcept.activity.type === 'ray-optics') {
      return (
        <RayOpticsActivity
          onComplete={() => markActivityComplete(subConcept.id)}
          isAlreadyCompleted={progress?.activityCompleted}
        />
      );
    }
    if (subConcept.activity.type === 'number-line') {
      return (
        <NumberLineActivity
          onComplete={() => markActivityComplete(subConcept.id)}
          isAlreadyCompleted={progress?.activityCompleted}
        />
      );
    }
    return (
      <BalanceScaleActivity
        onComplete={() => markActivityComplete(subConcept.id)}
        isAlreadyCompleted={progress?.activityCompleted}
      />
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <button
          onClick={onBackToConcepts}
          className="hover:text-white transition-colors"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span>Class {concept.classLevel}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="capitalize">{concept.subjectId}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button
          onClick={onBackToConcepts}
          className="hover:text-white transition-colors truncate max-w-[180px]"
        >
          {concept.title}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-300 font-medium truncate max-w-[200px]">
          {subConcept.title}
        </span>
      </div>

      {/* Top Header Card: Title, Estimated Time & Weighted Progress Ring */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
              <span className="text-cyan-400 font-semibold uppercase tracking-wider">
                Part {subConcept.order} of {concept.subConcepts.length}
              </span>
              <span>·</span>
              <span>{subConcept.estimatedMinutes} mins estimated</span>
              <span>·</span>
              <span className="text-slate-300 font-medium">{concept.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {subConcept.title}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              {subConcept.shortDescription}
            </p>
          </div>

          {/* Weighted Completion Gauge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center gap-5 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={overallPercentage >= 80 ? 'text-emerald-400' : 'text-cyan-400'}
                  strokeDasharray={`${overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-bold font-mono text-white">
                  {overallPercentage}%
                </span>
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="text-slate-400 font-medium">Weighted Milestone:</div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    progress?.lessonCompleted ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
                <span className="text-slate-300">Lesson (30%)</span>
                <span
                  className={`w-2 h-2 rounded-full ml-2 ${
                    progress?.activityCompleted ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
                <span className="text-slate-300">Activity (20%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    progress?.practiceCompleted ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
                <span className="text-slate-300">Practice (20%)</span>
                <span
                  className={`w-2 h-2 rounded-full ml-2 ${
                    progress?.assessmentPassed ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
                <span className="text-slate-300">Quiz ≥80% (30%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'explanation'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Concept Explanation</span>
            {progress?.lessonCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'activity'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>2. Interactive Activity</span>
            {progress?.activityCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'examples'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Worked Examples</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'practice'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. Guided Practice</span>
            {progress?.practiceCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'revision'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>5. Quick Revision</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'assessment'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>6. Mastery Assessment</span>
            {progress?.assessmentPassed && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* SECTION CONTENT ACCORDING TO ACTIVE TAB */}
      <div className="space-y-6">
        {/* TAB 1: OBJECTIVES & EXPLANATION */}
        {activeTab === 'explanation' && (
          <div className="space-y-6">
            {/* Learning Outcomes */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Learning Objectives</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subConcept.learningObjectives.map((obj, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-900/80 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation Deep Dive */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Concept Introduction</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {subConcept.explanation.introduction}
                </p>
              </div>

              {/* Key Definitions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Essential Definitions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subConcept.explanation.keyDefinitions.map((def, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                    >
                      <div className="text-sm font-bold text-cyan-300">{def.term}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{def.definition}</p>
                      {def.formula && (
                        <div className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 p-2 rounded border border-slate-800">
                          {def.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Breakdowns */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Step-by-Step Breakdown
                </h4>
                <div className="space-y-3">
                  {subConcept.explanation.breakdownSteps.map((step, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2"
                    >
                      <div className="font-bold text-white text-sm">{step.title}</div>
                      <p className="leading-relaxed">{step.content}</p>
                      {step.callout && (
                        <div className="p-2.5 rounded bg-blue-950/60 border border-blue-800/60 text-cyan-200">
                          {step.callout}
                        </div>
                      )}
                      {step.formula && (
                        <div className="font-mono text-cyan-300 font-bold bg-slate-900 px-3 py-1.5 rounded inline-block">
                          {step.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Common Mistakes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Rules vs. Common Mistakes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subConcept.explanation.rulesAndMistakes.map((rm, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Golden Rule
                        </span>
                        <p className="text-xs text-slate-200 font-medium mt-0.5">{rm.rule}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                          Common Mistake
                        </span>
                        <p className="text-xs text-rose-200/80 mt-0.5">{rm.commonMistake}</p>
                      </div>
                      <div className="text-[11px] text-slate-400 italic">
                        Why it matters: {rm.whyItMatters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mark Lesson as Understood Action */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  {progress?.lessonCompleted ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Lesson understood (+30% awarded)
                    </span>
                  ) : (
                    <span>Click below to complete the lesson study section (+30% weight)</span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!progress?.lessonCompleted && (
                    <button
                      onClick={() => markLessonComplete(subConcept.id)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
                    >
                      Mark as Understood (+30%)
                    </button>
                  )}
                  <button
                    onClick={() => {
                      markLessonComplete(subConcept.id);
                      setActiveTab('activity');
                    }}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
                  >
                    <span>Continue to Activity</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {renderActivity()}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setActiveTab('examples')}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <span>Continue to Worked Examples</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: WORKED EXAMPLES */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            {subConcept.workedExamples.map((ex, exIdx) => (
              <div
                key={ex.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Worked Example {exIdx + 1}
                  </span>
                  {ex.realWorldApplication && (
                    <span className="text-xs text-slate-400 italic">
                      Real-world application
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white">{ex.problem}</h4>

                <div className="space-y-3 mt-4">
                  {ex.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-blue-950 text-cyan-400 border border-blue-700/60 flex items-center justify-center text-[10px]">
                          {step.stepNumber}
                        </span>
                        <span>{step.title}</span>
                      </div>
                      <div className="font-mono text-cyan-300 font-bold text-sm pl-7 py-1">
                        {step.math}
                      </div>
                      <p className="text-xs text-slate-400 pl-7">{step.explanation}</p>
                    </div>
                  ))}
                </div>

                {ex.realWorldApplication && (
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-slate-300 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Real-Life Context: </strong>
                      {ex.realWorldApplication}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setActiveTab('practice')}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <span>Continue to Guided Practice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: GUIDED PRACTICE */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Guided Practice with Hints
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Attempt these warmup questions before taking the final assessment. Answer correctly to earn +20% completion!
              </p>

              <div className="space-y-6">
                {subConcept.guidedPractice.map((gp, i) => {
                  const selected = practiceAnswers[gp.id];
                  const isSubmitted = selected !== undefined;
                  const isCorrect = selected === gp.correctIndex;
                  const showHint = showPracticeHints[gp.id] || false;

                  return (
                    <div
                      key={gp.id}
                      className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          Practice Problem {i + 1}
                        </span>
                        <button
                          onClick={() =>
                            setShowPracticeHints((prev) => ({
                              ...prev,
                              [gp.id]: !prev[gp.id]
                            }))
                          }
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                        </button>
                      </div>

                      <h4 className="text-sm font-semibold text-white">{gp.question}</h4>

                      {showHint && (
                        <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800/60 text-xs text-amber-200">
                          💡 Hint: {gp.hint}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {gp.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() =>
                              handlePracticeSelect(gp.id, optIdx, gp.correctIndex)
                            }
                            className={`p-3 text-left rounded-lg text-xs font-medium border transition-all ${
                              selected === optIdx
                                ? optIdx === gp.correctIndex
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="font-mono text-slate-400 mr-2 font-bold">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>

                      {isSubmitted && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                              : 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          <strong>{isCorrect ? 'Correct! ' : 'Incorrect: '}</strong>
                          {gp.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
                <button
                  onClick={() => setActiveTab('revision')}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                  <span>Review Summary Sheet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: QUICK REVISION */}
        {activeTab === 'revision' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>{subConcept.revisionSummary.title}</span>
            </div>

            <div className="space-y-2.5">
              {subConcept.revisionSummary.points.map((point, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {subConcept.revisionSummary.formulas && subConcept.revisionSummary.formulas.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Formula &amp; Law Reference
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subConcept.revisionSummary.formulas.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <span className="text-xs text-slate-400">{f.name}:</span>
                      <span className="font-mono text-cyan-300 font-bold text-xs">{f.expression}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveTab('assessment')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <span>Take Mastery Assessment (80% Required)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: ASSESSMENT */}
        {activeTab === 'assessment' && (
          <AssessmentComponent
            subConceptId={subConcept.id}
            questions={subConcept.assessmentQuestions}
            onPass={() => {
              // celebration & refresh
            }}
            onReviewRequested={() => setActiveTab('explanation')}
          />
        )}
      </div>

      {/* Bottom Sticky-Free Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous Button */}
        {prevSubConcept ? (
          <button
            onClick={() => onNavigateSubConcept(prevSubConcept.id)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate max-w-[180px]">Prev: {prevSubConcept.title}</span>
          </button>
        ) : (
          <div />
        )}

        {/* Status Text */}
        <div className="text-xs text-slate-400 text-center">
          {progress?.isCompleted ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-4 h-4" /> Sub-concept Completed (≥80%)
            </span>
          ) : (
            <span>
              Achieve ≥80% completion + pass assessment to unlock subsequent topics
            </span>
          )}
        </div>

        {/* Next Button */}
        {nextSubConcept ? (
          <button
            disabled={!isNextUnlocked}
            onClick={() => onNavigateSubConcept(nextSubConcept.id)}
            className={`w-full sm:w-auto px-5 py-2 text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${
              isNextUnlocked
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
            title={
              isNextUnlocked
                ? 'Go to next sub-concept'
                : 'Locked: Requires ≥80% completion and passing score on current assessment'
            }
          >
            <span className="truncate max-w-[180px]">Next: {nextSubConcept.title}</span>
            {isNextUnlocked ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <button
            onClick={onBackToConcepts}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Finish Chapter</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
