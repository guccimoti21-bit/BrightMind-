import React, { useState } from 'react';
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
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { SubConcept, Concept, ChapterQuizLink } from '../../types/curriculum';
import { useProgress } from '../../context/ProgressContext';
import { getQuizForChapter, getCachedQuizLinks, QUIZ_LINKS_UPDATED_EVENT } from '../../services/quizLinkService';
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

  const [chapterQuiz, setChapterQuiz] = useState<ChapterQuizLink | undefined>(() =>
    getQuizForChapter(getCachedQuizLinks(), concept.id)
  );

  React.useEffect(() => {
    const updateQuiz = () => {
      setChapterQuiz(getQuizForChapter(getCachedQuizLinks(), concept.id));
    };
    updateQuiz();
    window.addEventListener(QUIZ_LINKS_UPDATED_EVENT, updateQuiz);
    return () => window.removeEventListener(QUIZ_LINKS_UPDATED_EVENT, updateQuiz);
  }, [concept.id]);

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
      <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap">
        <button
          onClick={onBackToConcepts}
          className="hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <span>Class {concept.classLevel}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <span className="capitalize">{concept.subjectId}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <button
          onClick={onBackToConcepts}
          className="hover:text-[#2563EB] transition-colors truncate max-w-[180px] cursor-pointer"
        >
          {concept.title}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <span className="text-[#2563EB] font-medium truncate max-w-[200px]">
          {subConcept.title}
        </span>
      </div>

      {/* Top Header Card: Title, Estimated Time & Weighted Progress Ring */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-[#64748B] mb-1">
              <span className="text-[#2563EB] font-semibold uppercase tracking-wider">
                Part {subConcept.order} of {concept.subConcepts.length}
              </span>
              <span>·</span>
              <span>{subConcept.estimatedMinutes} mins estimated</span>
              <span>·</span>
              <span className="text-[#475569] font-medium">{concept.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              {subConcept.title}
            </h1>
            <p className="text-sm text-[#475569] mt-1 max-w-3xl">
              {subConcept.shortDescription}
            </p>
          </div>

          {/* Weighted Completion Gauge */}
          <div className="bg-[#F8FAFF] border border-[#BFDBFE] rounded-2xl p-4 flex items-center gap-5 shrink-0 shadow-sm">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E2E8F0]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={overallPercentage >= 80 ? 'text-[#16A34A]' : 'text-[#2563EB]'}
                  strokeDasharray={`${overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-bold font-mono text-[#111827]">
                  {overallPercentage}%
                </span>
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="text-[#64748B] font-medium">Weighted Milestone:</div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    progress?.lessonCompleted ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                  }`}
                />
                <span className="text-[#475569]">Lesson (30%)</span>
                <span
                  className={`w-2 h-2 rounded-full ml-2 ${
                    progress?.activityCompleted ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                  }`}
                />
                <span className="text-[#475569]">Activity (20%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    progress?.practiceCompleted ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                  }`}
                />
                <span className="text-[#475569]">Practice (20%)</span>
                <span
                  className={`w-2 h-2 rounded-full ml-2 ${
                    progress?.assessmentPassed ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                  }`}
                />
                <span className="text-[#475569]">Quiz ≥80% (30%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 mt-6 pt-6 border-t border-[#EDF2F7] overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'explanation'
                ? 'btn-primary'
                : 'bg-[#F8FAFF] text-[#475569] hover:bg-[#F1F5FF] border border-[#E2E8F0]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Explanation</span>
            {progress?.lessonCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'activity'
                ? 'btn-primary'
                : 'bg-[#F8FAFF] text-[#475569] hover:bg-[#F1F5FF] border border-[#E2E8F0]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Virtual Lab</span>
            {progress?.activityCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('examples')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'examples'
                ? 'btn-primary'
                : 'bg-[#F8FAFF] text-[#475569] hover:bg-[#F1F5FF] border border-[#E2E8F0]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Worked Examples</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'practice'
                ? 'btn-primary'
                : 'bg-[#F8FAFF] text-[#475569] hover:bg-[#F1F5FF] border border-[#E2E8F0]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. Guided Practice</span>
            {progress?.practiceCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'revision'
                ? 'btn-primary'
                : 'bg-[#F8FAFF] text-[#475569] hover:bg-[#F1F5FF] border border-[#E2E8F0]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>5. Quick Revision</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'assessment'
                ? 'btn-primary'
                : 'bg-[#F8FAFF] text-[#475569] hover:bg-[#F1F5FF] border border-[#E2E8F0]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
            <span>6. Quiz (≥80%)</span>
            {progress?.assessmentPassed && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] ml-1" />
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
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Learning Objectives</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subConcept.learningObjectives.map((obj, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation Deep Dive */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">Concept Introduction</h3>
                <p className="text-[#475569] text-sm leading-relaxed">
                  {subConcept.explanation.introduction}
                </p>
              </div>

              {/* Key Definitions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                  Essential Definitions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subConcept.explanation.keyDefinitions.map((def, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#F8FAFF] border border-[#BFDBFE] space-y-2"
                    >
                      <div className="text-sm font-bold text-[#2563EB]">{def.term}</div>
                      <p className="text-xs text-[#475569] leading-relaxed">{def.definition}</p>
                      {def.formula && (
                        <div className="font-mono text-xs font-bold text-[#111827] bg-[#FFFFFF] p-2 rounded border border-[#E2E8F0]">
                          {def.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Breakdowns */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                  Step-by-Step Breakdown
                </h4>
                <div className="space-y-3">
                  {subConcept.explanation.breakdownSteps.map((step, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] text-xs text-[#475569] space-y-2"
                    >
                      <div className="font-bold text-[#111827] text-sm">{step.title}</div>
                      <p className="leading-relaxed">{step.content}</p>
                      {step.callout && (
                        <div className="p-2.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-medium">
                          {step.callout}
                        </div>
                      )}
                      {step.formula && (
                        <div className="font-mono text-[#2563EB] font-bold bg-[#FFFFFF] px-3 py-1.5 rounded inline-block border border-[#E2E8F0]">
                          {step.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Common Mistakes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                  Rules vs. Common Mistakes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subConcept.explanation.rulesAndMistakes.map((rm, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] space-y-3 shadow-2xs"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                          Golden Rule
                        </span>
                        <p className="text-xs text-[#111827] font-medium mt-0.5">{rm.rule}</p>
                      </div>
                      <div className="pt-2 border-t border-[#EDF2F7]">
                        <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider block">
                          Common Mistake
                        </span>
                        <p className="text-xs text-[#DC2626] mt-0.5">{rm.commonMistake}</p>
                      </div>
                      <div className="text-[11px] text-[#64748B] italic">
                        Why it matters: {rm.whyItMatters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mark Lesson as Understood Action */}
              <div className="pt-6 border-t border-[#EDF2F7] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#64748B]">
                  {progress?.lessonCompleted ? (
                    <span className="text-[#16A34A] font-semibold flex items-center gap-1.5">
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
                      className="btn-secondary px-5 py-2.5 text-xs font-semibold cursor-pointer"
                    >
                      Mark as Understood (+30%)
                    </button>
                  )}
                  <button
                    onClick={() => {
                      markLessonComplete(subConcept.id);
                      setActiveTab('activity');
                    }}
                    className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Activity Lab</span>
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
                className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
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
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
                  <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                    Worked Example {exIdx + 1}
                  </span>
                  {ex.realWorldApplication && (
                    <span className="text-xs text-[#64748B] italic">
                      Real-world application
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-[#111827]">{ex.problem}</h4>

                <div className="space-y-3 mt-4">
                  {ex.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                        <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center text-[10px]">
                          {step.stepNumber}
                        </span>
                        <span>{step.title}</span>
                      </div>
                      <div className="font-mono text-[#2563EB] font-bold text-sm pl-7 py-1">
                        {step.math}
                      </div>
                      <p className="text-xs text-[#475569] pl-7">{step.explanation}</p>
                    </div>
                  ))}
                </div>

                {ex.realWorldApplication && (
                  <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#475569] flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#111827]">Real-Life Context: </strong>
                      {ex.realWorldApplication}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setActiveTab('practice')}
                className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
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
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#111827] mb-1">
                Guided Practice with Hints
              </h3>
              <p className="text-xs text-[#64748B] mb-6">
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
                      className="p-5 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                          Practice Problem {i + 1}
                        </span>
                        <button
                          onClick={() =>
                            setShowPracticeHints((prev) => ({
                              ...prev,
                              [gp.id]: !prev[gp.id]
                            }))
                          }
                          className="text-xs text-[#D97706] hover:text-[#B45309] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                        </button>
                      </div>

                      <h4 className="text-sm font-semibold text-[#111827]">{gp.question}</h4>

                      {showHint && (
                        <div className="p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E]">
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
                            className={`p-3 text-left rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              selected === optIdx
                                ? optIdx === gp.correctIndex
                                  ? 'bg-[#DCFCE7] border-[#16A34A] text-[#16A34A] font-bold'
                                  : 'bg-[#FEE2E2] border-[#DC2626] text-[#DC2626] font-bold'
                                : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5FF]'
                            }`}
                          >
                            <span className="font-mono text-[#64748B] mr-2 font-bold">
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
                              ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                              : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
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

              <div className="flex justify-end gap-3 pt-6 border-t border-[#EDF2F7] mt-6">
                <button
                  onClick={() => setActiveTab('revision')}
                  className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
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
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#D97706] text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>{subConcept.revisionSummary.title}</span>
            </div>

            <div className="space-y-2.5">
              {subConcept.revisionSummary.points.map((point, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] text-xs text-[#475569] flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {subConcept.revisionSummary.formulas && subConcept.revisionSummary.formulas.length > 0 && (
              <div className="pt-4 border-t border-[#EDF2F7]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                  Formula &amp; Law Reference
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subConcept.revisionSummary.formulas.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between"
                    >
                      <span className="text-xs text-[#64748B]">{f.name}:</span>
                      <span className="font-mono text-[#2563EB] font-bold text-xs">{f.expression}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-[#EDF2F7] flex justify-end">
              <button
                onClick={() => setActiveTab('assessment')}
                className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
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
            onPass={() => {}}
            onReviewRequested={() => setActiveTab('explanation')}
            chapterQuiz={chapterQuiz}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Previous Button */}
        {prevSubConcept ? (
          <button
            onClick={() => onNavigateSubConcept(prevSubConcept.id)}
            className="w-full sm:w-auto btn-secondary px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate max-w-[180px]">Prev: {prevSubConcept.title}</span>
          </button>
        ) : (
          <div />
        )}

        {/* Status Text */}
        <div className="text-xs text-[#64748B] text-center">
          {progress?.isCompleted ? (
            <span className="text-[#16A34A] font-semibold flex items-center gap-1 justify-center">
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
            className={`w-full sm:w-auto px-5 py-2 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isNextUnlocked
                ? 'btn-primary'
                : 'bg-[#F1F5FF] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
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
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {chapterQuiz && chapterQuiz.isActive && (
              <a
                href={chapterQuiz.quizUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]"
                title={`Open official ${chapterQuiz.platformName || 'online'} quiz in a new tab`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>Take Chapter Quiz ({chapterQuiz.platformName || 'Online'})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onBackToConcepts}
              className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Finish Chapter</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
