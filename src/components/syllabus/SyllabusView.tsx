import React, { useState } from 'react';
import {
  ClassLevel,
  SubjectId,
  Concept
} from '../../types/curriculum';
import { CURRICULUM_DATA, CLASS_METADATA } from '../../data/curriculumData';
import { useProgress } from '../../context/ProgressContext';
import {
  BookOpen,
  Atom,
  Binary,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  Filter,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SyllabusViewProps {
  currentClass: ClassLevel;
  currentSubject: SubjectId;
  onSelectClass: (c: ClassLevel) => void;
  onSelectSubject: (s: SubjectId) => void;
  onSelectConcept: (conceptId: string) => void;
}

export function SyllabusView({
  currentClass,
  currentSubject,
  onSelectClass,
  onSelectSubject,
  onSelectConcept
}: SyllabusViewProps) {
  const { getConceptProgressPercentage, getSubjectProgressPercentage } = useProgress();
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  // Filter concepts for active class and active subject
  const concepts = CURRICULUM_DATA.filter(
    (c) => c.classLevel === currentClass && c.subjectId === currentSubject
  );

  const subjectProgress = getSubjectProgressPercentage(currentClass, currentSubject);

  const filteredConcepts = concepts.filter((c) => {
    const p = getConceptProgressPercentage(c.id);
    if (filter === 'completed') return p >= 80;
    if (filter === 'in-progress') return p > 0 && p < 80;
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Class Level Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Select Class Level
          </span>
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
            {CLASS_METADATA.map((cm) => (
              <button
                key={cm.level}
                onClick={() => onSelectClass(cm.level)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  currentClass === cm.level
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                Class {cm.level}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Toggle */}
        <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => onSelectSubject('mathematics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
              currentSubject === 'mathematics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Mathematics</span>
          </button>
          <button
            onClick={() => onSelectSubject('science')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
              currentSubject === 'science'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>Science</span>
          </button>
        </div>
      </div>

      {/* Curriculum Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-purple-950/50 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>NCERT &amp; CBSE Aligned Academic Syllabus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Class {currentClass} {currentSubject === 'mathematics' ? 'Mathematics' : 'Science'}
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {currentSubject === 'mathematics'
              ? 'Develop numerical fluency, algebraic balancing, geometric proof rigor, and statistical thinking through interactive sub-concept learning paths.'
              : 'Investigate physical forces, wave dynamics, chemical molecular reactions, and biological life processes with virtual experimentation.'}
          </p>
        </div>

        {/* Subject Progress Gauge */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center shrink-0 min-w-[140px]">
          <div className="text-xs text-slate-400">Subject Mastery</div>
          <div className="text-3xl font-mono font-extrabold text-cyan-300 my-1">
            {subjectProgress}%
          </div>
          <div className="text-[11px] text-slate-500">
            {concepts.length} Curated Chapters
          </div>
        </div>
      </div>

      {/* Filter Tabs & Count */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
            Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Chapters ({concepts.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'in-progress'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredConcepts.length} chapter{filteredConcepts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Concepts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredConcepts.map((concept) => {
          const progressPercent = getConceptProgressPercentage(concept.id);
          const isCompleted = progressPercent >= 80;

          return (
            <div
              key={concept.id}
              onClick={() => onSelectConcept(concept.id)}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/70 transition-all rounded-2xl p-6 shadow-lg cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-md">
                    {concept.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{concept.estimatedHours}h study</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {concept.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {concept.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{concept.subConcepts.length} Sub-concepts</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isCompleted
                        ? 'text-emerald-400 flex items-center gap-1'
                        : progressPercent > 0
                        ? 'text-cyan-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </>
                    ) : progressPercent > 0 ? (
                      'In Progress'
                    ) : (
                      'Start Chapter'
                    )}
                  </span>

                  <span className="text-xs font-semibold text-blue-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors">
                    <span>Explore Path</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
