import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Concept } from '../../types/curriculum';
import { useProgress } from '../../context/ProgressContext';

interface ConceptDetailViewProps {
  concept: Concept;
  onBack: () => void;
  onSelectSubConcept: (subConceptId: string) => void;
}

export function ConceptDetailView({
  concept,
  onBack,
  onSelectSubConcept
}: ConceptDetailViewProps) {
  const {
    state,
    calculateSubConceptCompletion,
    isSubConceptUnlocked,
    getConceptProgressPercentage
  } = useProgress();

  const overallProgress = getConceptProgressPercentage(concept.id);

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
        </div>
      </div>
    </div>
  );
}
