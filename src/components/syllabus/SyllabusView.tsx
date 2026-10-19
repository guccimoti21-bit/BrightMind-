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
  concepts?: Concept[];
  onSelectClass: (c: ClassLevel) => void;
  onSelectSubject: (s: SubjectId) => void;
  onSelectConcept: (conceptId: string) => void;
}

export function SyllabusView({
  currentClass,
  currentSubject,
  concepts: customConcepts,
  onSelectClass,
  onSelectSubject,
  onSelectConcept
}: SyllabusViewProps) {
  const { getConceptProgressPercentage, getSubjectProgressPercentage } = useProgress();
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  const dataSource = customConcepts || CURRICULUM_DATA;

  // Filter concepts for active class and active subject
  const concepts = dataSource.filter(
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
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div>
          <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
            Select Class Level
          </span>
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
            {CLASS_METADATA.map((cm) => (
              <button
                key={cm.level}
                onClick={() => onSelectClass(cm.level)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentClass === cm.level
                    ? 'btn-primary'
                    : 'bg-[#F8FAFF] text-[#475569] hover:text-[#111827] hover:bg-[#F1F5FF] border border-[#E2E8F0]'
                }`}
              >
                Class {cm.level}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Toggle */}
        <div className="bg-[#F1F5FF] p-1.5 rounded-xl border border-[#E2E8F0] flex items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => onSelectSubject('mathematics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentSubject === 'mathematics'
                ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#111827]'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Mathematics</span>
          </button>
          <button
            onClick={() => onSelectSubject('science')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentSubject === 'science'
                ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#111827]'
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>Science</span>
          </button>
        </div>
      </div>

      {/* Class Level Info & Progress Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] mb-1">
              <span className="capitalize">{currentSubject} Curriculum</span>
              <span>·</span>
              <span>Class {currentClass}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Class {currentClass} {currentSubject === 'mathematics' ? 'Mathematics' : 'Science'}
            </h1>
            <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
              {CLASS_METADATA.find((c) => c.level === currentClass)?.description}
            </p>
          </div>

          <div className="bg-[#F8FAFF] border border-[#BFDBFE] rounded-2xl p-4 sm:p-5 min-w-[200px] text-center shrink-0">
            <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider">
              Subject Mastery
            </div>
            <div className="text-3xl font-black font-mono text-[#2563EB] my-1">
              {subjectProgress}%
            </div>
            <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                style={{ width: `${subjectProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Concept List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Chapters ({concepts.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F1F5FF] rounded-lg border border-[#E2E8F0]">
            {(['all', 'in-progress', 'completed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === mode
                    ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm font-bold'
                    : 'text-[#475569] hover:text-[#111827]'
                }`}
              >
                {mode === 'all' ? 'All' : mode === 'in-progress' ? 'In Progress' : 'Mastered (≥80%)'}
              </button>
            ))}
          </div>
        </div>

        {filteredConcepts.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-[#64748B] mx-auto" />
            <h3 className="text-base font-bold text-[#111827]">No chapters match this filter</h3>
            <p className="text-xs text-[#64748B]">
              Change the filter mode or select another class level above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConcepts.map((concept, index) => {
              const progress = getConceptProgressPercentage(concept.id);
              const isMastered = progress >= 80;

              return (
                <div
                  key={concept.id}
                  onClick={() => onSelectConcept(concept.id)}
                  className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#2563EB]">
                          0{index + 1}
                        </span>
                        <span className="text-[#64748B]">·</span>
                        <span className="text-[#475569] font-medium">{concept.category}</span>
                      </div>

                      {isMastered ? (
                        <div className="flex items-center gap-1 text-xs text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mastered</span>
                        </div>
                      ) : (
                        <div className="text-xs font-mono font-semibold text-[#64748B]">
                          {progress}% Complete
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                      {concept.title}
                    </h3>

                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                      {concept.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#64748B] pt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{concept.subConcepts.length} sub-concepts</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{concept.estimatedHours} hrs</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F1F5FF] h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isMastered ? 'bg-[#16A34A]' : 'bg-[#2563EB]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#EDF2F7] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                    <span>Inspect Concept Details</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
