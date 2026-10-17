import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  Award,
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
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Syllabus</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span>Class {concept.classLevel}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="capitalize">{concept.subjectId}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-300 font-medium">{concept.title}</span>
      </div>

      {/* Concept Hero Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <span className="text-cyan-400 font-semibold uppercase tracking-wider">
                {concept.category}
              </span>
              <span>·</span>
              <span>Class {concept.classLevel} Curriculum</span>
              <span>·</span>
              <span>{concept.estimatedHours} Hours total</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {concept.title}
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {concept.description}
            </p>
          </div>

          {/* Progress Overview Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center sm:text-right shrink-0">
            <div className="text-xs text-slate-400">Chapter Mastery</div>
            <div className="text-3xl font-mono font-extrabold text-cyan-300 my-1">
              {overallProgress}%
            </div>
            <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto sm:ml-auto">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Learning Path */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Structured Sub-Concepts Learning Path</span>
          </h2>
          <span className="text-xs text-slate-400">
            {concept.subConcepts.length} progressive modules
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
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
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/20'
                      : inProgress
                      ? 'bg-blue-950 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/20'
                      : unlocked
                      ? 'bg-slate-900 border-slate-600 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
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
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer shadow-lg'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (unlocked) onSelectSubConcept(sub.id);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-cyan-400">
                          Step {index + 1}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          {sub.estimatedMinutes} mins
                        </span>
                        <span className="text-slate-600">·</span>
                        <span
                          className={`font-semibold ${
                            isCompleted
                              ? 'text-emerald-400'
                              : inProgress
                              ? 'text-cyan-400'
                              : unlocked
                              ? 'text-slate-300'
                              : 'text-slate-600'
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
                          unlocked ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {sub.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      {unlocked && (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {completion}%
                          </span>
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'
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
                          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isCompleted
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCompleted ? 'Review' : inProgress ? 'Continue' : 'Start'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/60">
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
