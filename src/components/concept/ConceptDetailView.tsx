import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  ExternalLink,
  Globe,
  Trophy
} from 'lucide-react';
import { Concept, ChapterQuizLink } from '../../types/curriculum';
import { useProgress } from '../../context/ProgressContext';
import { getQuizForChapter, getCachedQuizLinks, QUIZ_LINKS_UPDATED_EVENT } from '../../services/quizLinkService';
import { LearningResourcesSection } from './LearningResourcesSection';

interface ConceptDetailViewProps {
  concept: Concept;
  onBack: () => void;
  onSelectSubConcept: (subConceptId: string) => void;
  quizLink?: ChapterQuizLink;
}

export function ConceptDetailView({
  concept,
  onBack,
  onSelectSubConcept,
  quizLink: propQuizLink
}: ConceptDetailViewProps) {
  const {
    state,
    calculateSubConceptCompletion,
    isSubConceptUnlocked,
    getConceptProgressPercentage
  } = useProgress();

  const overallProgress = getConceptProgressPercentage(concept.id);

  const [activeQuiz, setActiveQuiz] = React.useState<ChapterQuizLink | undefined>(() => {
    if (propQuizLink) return propQuizLink;
    return getQuizForChapter(getCachedQuizLinks(), concept.id);
  });

  React.useEffect(() => {
    if (propQuizLink) {
      setActiveQuiz(propQuizLink);
      return;
    }
    const updateQuiz = () => {
      setActiveQuiz(getQuizForChapter(getCachedQuizLinks(), concept.id));
    };
    updateQuiz();
    window.addEventListener(QUIZ_LINKS_UPDATED_EVENT, updateQuiz);
    return () => window.removeEventListener(QUIZ_LINKS_UPDATED_EVENT, updateQuiz);
  }, [propQuizLink, concept.id]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Back and Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <button
          onClick={onBack}
          className="hover:text-[#2563EB] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Syllabus</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <span>Class {concept.classLevel}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <span className="capitalize">{concept.subjectId}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <span className="text-[#2563EB] font-medium">{concept.title}</span>
      </div>

      {/* Concept Hero Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2">
              <span className="text-[#2563EB] font-semibold uppercase tracking-wider">
                {concept.category}
              </span>
              <span>·</span>
              <span>Class {concept.classLevel} Curriculum</span>
              <span>·</span>
              <span>{concept.estimatedHours} Hours total</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              {concept.title}
            </h1>
            <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
              {concept.description}
            </p>
          </div>

          {/* Progress Overview Card */}
          <div className="bg-[#F8FAFF] border border-[#BFDBFE] rounded-2xl p-5 text-center sm:text-right shrink-0">
            <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider">
              Chapter Mastery
            </div>
            <div className="text-3xl font-mono font-black text-[#2563EB] my-1">
              {overallProgress}%
            </div>
            <div className="w-36 h-2 bg-[#E2E8F0] rounded-full overflow-hidden mx-auto sm:ml-auto">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Learning Path */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>Structured Sub-Concepts Learning Path</span>
          </h2>
          <span className="text-xs text-[#64748B]">
            {concept.subConcepts.length} progressive modules
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E2E8F0]">
          {concept.subConcepts.map((sub, index) => {
            const unlocked = isSubConceptUnlocked(concept.id, sub.id);
            const subProgress = state.progressBySubConcept[sub.id];
            const completion = calculateSubConceptCompletion(subProgress);
            const isCompleted = subProgress?.isCompleted || false;
            const inProgress = unlocked && completion > 0 && !isCompleted;

            return (
              <div key={sub.id} className="relative">
                {/* Node Milestone Dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-6 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#DCFCE7] border-[#16A34A] text-[#16A34A] ring-4 ring-[#DCFCE7]'
                      : inProgress
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] ring-4 ring-[#DBEAFE]'
                      : unlocked
                      ? 'bg-[#FFFFFF] border-[#2563EB] text-[#2563EB]'
                      : 'bg-[#F1F5FF] border-[#CBD5E1] text-[#94A3B8]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : unlocked ? (
                    index + 1
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>

                {/* Sub-Concept Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    unlocked
                      ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] cursor-pointer shadow-sm'
                      : 'bg-[#F8FAFF] border-[#EDF2F7] text-[#94A3B8] opacity-75 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (unlocked) onSelectSubConcept(sub.id);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[#2563EB]">
                          Step {index + 1}
                        </span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span className="flex items-center gap-1 text-[#64748B]">
                          <Clock className="w-3 h-3" />
                          {sub.estimatedMinutes} mins
                        </span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span
                          className={`font-semibold ${
                            isCompleted
                              ? 'text-[#16A34A]'
                              : inProgress
                              ? 'text-[#2563EB]'
                              : unlocked
                              ? 'text-[#475569]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          {isCompleted
                            ? 'Completed'
                            : inProgress
                            ? 'In Progress'
                            : unlocked
                            ? 'Ready to Start'
                            : 'Locked (Requires 80% on Step ' + index + ')'}
                        </span>
                      </div>

                      <h3
                        className={`text-base font-bold ${
                          unlocked ? 'text-[#111827]' : 'text-[#64748B]'
                        }`}
                      >
                        {sub.title}
                      </h3>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {sub.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      {unlocked && (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#111827]">
                            {completion}%
                          </span>
                          <div className="w-20 h-1.5 bg-[#F1F5FF] rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                isCompleted ? 'bg-[#16A34A]' : 'bg-[#2563EB]'
                              }`}
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {unlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubConcept(sub.id);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isCompleted
                              ? 'btn-secondary'
                              : 'btn-primary'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCompleted ? 'Review' : inProgress ? 'Continue' : 'Start'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-[#64748B] bg-[#F1F5FF] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Chapter Curated Learning Resources (Google Drive & YouTube) */}
          <div className="relative pt-2">
            <LearningResourcesSection
              chapterId={concept.id}
              chapterTitle={concept.title}
            />
          </div>

          {/* Chapter Finale External Quiz */}
          {activeQuiz && activeQuiz.isActive && (
            <div className="relative pt-4">
              {/* Node Milestone Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-10 -translate-x-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  overallProgress >= 80
                    ? 'bg-[#FEF3C7] border-[#D97706] text-[#D97706] ring-4 ring-[#FEF3C7]'
                    : 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] ring-4 ring-[#DBEAFE]'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
              </div>

              {/* External Quiz Card */}
              <div className="bg-gradient-to-br from-[#FFFFFF] via-[#F8FAFF] to-[#EFF6FF] border-2 border-[#BFDBFE] rounded-2xl p-6 shadow-[0_8px_30px_rgba(37,99,235,0.08)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-[#2563EB] text-white font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3" />
                        <span>Chapter Finale</span>
                      </span>
                      <span className="bg-[#FEF3C7] text-[#92400E] font-bold px-2.5 py-0.5 rounded-md border border-[#FDE68A]">
                        {activeQuiz.platformName || 'Online Quiz'}
                      </span>
                      {activeQuiz.timeLimitMinutes && (
                        <span className="text-[#64748B] flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {activeQuiz.timeLimitMinutes} mins
                        </span>
                      )}
                      {activeQuiz.questionCount && (
                        <span className="text-[#64748B] font-medium">
                          · {activeQuiz.questionCount} questions
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#111827]">
                      {activeQuiz.title}
                    </h3>

                    <p className="text-xs text-[#475569] leading-relaxed">
                      {activeQuiz.description ||
                        `Reinforce your mastery of ${concept.title} with an official external quiz. Click below to open and compete.`}
                    </p>

                    <div className="text-[11px] text-[#64748B] flex items-center gap-1 pt-1">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Direct link opens in a new browser tab</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:items-end gap-2">
                    <a
                      href={activeQuiz.quizUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group-hover:scale-102"
                    >
                      <span>Take Official Quiz</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <span className="text-[10px] text-[#64748B] text-center sm:text-right font-medium">
                      {activeQuiz.platformName || 'External Website'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
