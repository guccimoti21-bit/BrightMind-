import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Atom,
  Binary,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  Search,
  Sparkles,
  CheckCircle2,
  Lock,
  Eye,
  ArrowRight,
  Filter,
  RefreshCw,
  Scale,
  Sun,
  ShieldCheck,
  FileText,
  Trophy,
  ExternalLink,
  Globe
} from 'lucide-react';
import { Concept, ClassLevel, SubjectId, SubConcept, ChapterQuizLink } from '../../types/curriculum';
import { CLASS_METADATA } from '../../data/curriculumData';
import { getQuizForChapter, getCachedQuizLinks, QUIZ_LINKS_UPDATED_EVENT } from '../../services/quizLinkService';

interface FrontPageChapterIndexProps {
  concepts: Concept[];
  isAuthenticated: boolean;
  onSelectConcept: (conceptId: string, subConceptId?: string) => void;
  onNavigateLogin: (message?: string, target?: string) => void;
  onNavigateRegister: () => void;
  onRefreshCurriculum?: () => Promise<void>;
}

export function FrontPageChapterIndex({
  concepts,
  isAuthenticated,
  onSelectConcept,
  onNavigateLogin,
  onNavigateRegister,
  onRefreshCurriculum
}: FrontPageChapterIndexProps) {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(8);
  const [selectedSubject, setSelectedSubject] = useState<'all' | SubjectId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [previewSubConcept, setPreviewSubConcept] = useState<{
    chapter: Concept;
    subConcept: SubConcept;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [quizzes, setQuizzes] = useState<ChapterQuizLink[]>(() => getCachedQuizLinks());

  React.useEffect(() => {
    const update = () => setQuizzes(getCachedQuizLinks());
    window.addEventListener(QUIZ_LINKS_UPDATED_EVENT, update);
    return () => window.removeEventListener(QUIZ_LINKS_UPDATED_EVENT, update);
  }, []);

  // Filter concepts based on class, subject, and search query
  const filteredConcepts = useMemo(() => {
    return concepts.filter((concept) => {
      // Class match
      if (concept.classLevel !== selectedClass) return false;

      // Subject match
      if (selectedSubject !== 'all' && concept.subjectId !== selectedSubject) return false;

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = concept.title.toLowerCase().includes(query);
        const matchesDesc = concept.description.toLowerCase().includes(query);
        const matchesCategory = concept.category?.toLowerCase().includes(query);
        const matchesSubConcepts = concept.subConcepts.some(
          (sub) =>
            sub.title.toLowerCase().includes(query) ||
            sub.shortDescription.toLowerCase().includes(query)
        );
        return matchesTitle || matchesDesc || matchesCategory || matchesSubConcepts;
      }

      return true;
    });
  }, [concepts, selectedClass, selectedSubject, searchQuery]);

  // Count chapters per class for badges
  const classCounts = useMemo(() => {
    const counts: Record<number, number> = { 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    concepts.forEach((c) => {
      if (counts[c.classLevel] !== undefined) {
        counts[c.classLevel]++;
      }
    });
    return counts;
  }, [concepts]);

  const handleRefresh = async () => {
    if (onRefreshCurriculum && !isRefreshing) {
      setIsRefreshing(true);
      await onRefreshCurriculum();
      setIsRefreshing(false);
    }
  };

  const handleAction = (conceptId: string, subId?: string) => {
    if (isAuthenticated) {
      onSelectConcept(conceptId, subId);
    } else {
      onNavigateLogin(
        'Log in with your student account to record progress, launch interactive lab simulations, and unlock subsequent topics with the 80% mastery rule.',
        'lesson'
      );
    }
  };

  return (
    <section id="chapter-index" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#EDF2F7]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Access Chapter Index (No Login Required to Browse)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            Curriculum &amp; Chapter Index
          </h2>
          <p className="text-sm sm:text-base text-[#475569] mt-1 max-w-2xl">
            Explore complete Science &amp; Mathematics syllabi for Classes 6 to 10. Click any chapter to inspect concept breakdowns, formulas, and worked solutions.
          </p>
        </div>

        {/* Live Admin Sync Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm text-xs text-[#475569]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="font-medium">Admin CMS Live Sync</span>
          </div>
          {onRefreshCurriculum && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F1F5FF] text-[#475569] hover:text-[#2563EB] transition-colors shadow-sm cursor-pointer"
              title="Refresh curriculum from Admin database"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#2563EB]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Class Level Selector Tabs (Classes 6-10) */}
      <div className="bg-[#FFFFFF] p-2 rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CLASS_METADATA.map((cm) => {
            const isSelected = selectedClass === cm.level;
            const count = classCounts[cm.level] || 0;
            return (
              <button
                key={cm.level}
                onClick={() => {
                  setSelectedClass(cm.level);
                  setExpandedChapterId(null);
                }}
                className={`p-3 sm:p-4 rounded-xl text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-[0_5px_14px_rgba(37,99,235,0.22)]'
                    : 'bg-[#F8FAFF] hover:bg-[#F1F5FF] text-[#475569] border border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold uppercase tracking-wider ${
                      isSelected ? 'text-blue-100' : 'text-[#64748B]'
                    }`}
                  >
                    Grade 0{cm.level}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF0FF] text-[#2563EB]'
                    }`}
                  >
                    {count} {count === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>
                <div
                  className={`text-base font-bold mt-1 ${
                    isSelected ? 'text-white' : 'text-[#111827]'
                  }`}
                >
                  Class {cm.level}
                </div>
                <div
                  className={`text-xs truncate mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-[#64748B]'
                  }`}
                >
                  {cm.title.replace(`Class ${cm.level} `, '')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F5FF] rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#111827]'
            }`}
          >
            All Subjects
          </button>
          <button
            onClick={() => setSelectedSubject('science')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedSubject === 'science'
                ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#111827]'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Science</span>
          </button>
          <button
            onClick={() => setSelectedSubject('mathematics')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedSubject === 'mathematics'
                ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#111827]'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Mathematics</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters or topics..."
            className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-[#111827]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chapters Grid */}
      {filteredConcepts.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F1F5FF] text-[#2563EB] mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#111827]">No chapters found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            No chapters match your current search or subject filter for Class {selectedClass}. Try clearing your search query or selecting a different subject.
          </p>
          <button
            onClick={() => {
              setSelectedSubject('all');
              setSearchQuery('');
            }}
            className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConcepts.map((chapter, index) => {
            const isExpanded = expandedChapterId === chapter.id;
            const isScience = chapter.subjectId === 'science';

            return (
              <div
                key={chapter.id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all"
              >
                {/* Main Chapter Summary Row */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
                        Chapter {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                      <span className="text-[#64748B]">·</span>
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          isScience ? 'text-[#0284C7]' : 'text-[#2563EB]'
                        }`}
                      >
                        {isScience ? <Atom className="w-3.5 h-3.5" /> : <Binary className="w-3.5 h-3.5" />}
                        <span className="capitalize">{chapter.subjectId}</span>
                      </span>
                      <span className="text-[#64748B]">·</span>
                      <span className="text-[#475569]">{chapter.category}</span>
                      <span className="text-[#64748B]">·</span>
                      <span className="text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>~{chapter.estimatedHours} Hours</span>
                      </span>
                      {(() => {
                        const q = getQuizForChapter(quizzes, chapter.id);
                        if (!q || !q.isActive) return null;
                        return (
                          <>
                            <span className="text-[#64748B]">·</span>
                            <span className="bg-[#FEF3C7] text-[#92400E] font-bold px-2 py-0.5 rounded border border-[#FDE68A] flex items-center gap-1 text-[11px]">
                              <Trophy className="w-3 h-3 text-[#D97706]" />
                              <span>{q.platformName || 'Online'} Quiz</span>
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    <h3 className="text-xl font-bold text-[#111827] hover:text-[#2563EB] transition-colors">
                      {chapter.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
                      {chapter.description}
                    </p>

                    {/* Quick highlights */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#475569]">
                      <span className="font-semibold text-[#111827]">
                        {chapter.subConcepts.length} Topics Covered:
                      </span>
                      {chapter.subConcepts.slice(0, 3).map((sub, i) => (
                        <span key={sub.id} className="text-[#64748B]">
                          {i + 1}. {sub.title}
                          {i < Math.min(chapter.subConcepts.length, 3) - 1 ? ' · ' : ''}
                        </span>
                      ))}
                      {chapter.subConcepts.length > 3 && (
                        <span className="text-[#2563EB] font-medium">
                          +{chapter.subConcepts.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                    <button
                      onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#F1F5FF] hover:bg-[#EAF0FF] text-[#2563EB] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#BFDBFE]"
                    >
                      <span>{isExpanded ? 'Hide Topics' : 'View Topics & Labs'}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleAction(chapter.id)}
                      className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-blue-200" />}
                      <span>{isAuthenticated ? 'Start Chapter' : 'Launch Lab'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Sub-concept breakdown (Accordion) */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 bg-[#F8FAFF] border-t border-[#EDF2F7] space-y-3">
                    <div className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center justify-between">
                      <span>Topics, Virtual Manipulatives &amp; Worked Solutions</span>
                      <span className="text-[#64748B] normal-case font-normal text-[11px]">
                        Free preview available for every topic
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {chapter.subConcepts.map((sub, idx) => (
                        <div
                          key={sub.id}
                          className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] space-y-2.5 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-[#2563EB]">
                                Concept {idx + 1}
                              </span>
                              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {sub.estimatedMinutes} mins
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#111827] mt-1">{sub.title}</h4>
                            <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                              {sub.shortDescription}
                            </p>

                            {/* Activity badge if present */}
                            {sub.activity && (
                              <div className="mt-2 text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-1 rounded inline-flex items-center gap-1 border border-[#BFDBFE]">
                                <Scale className="w-3 h-3" />
                                <span>Lab: {sub.activity.title}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#EDF2F7] flex items-center justify-between">
                            <button
                              onClick={() => setPreviewSubConcept({ chapter, subConcept: sub })}
                              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Read Lesson Notes</span>
                            </button>

                            <button
                              onClick={() => handleAction(chapter.id, sub.id)}
                              className="text-xs font-bold text-[#111827] hover:text-[#2563EB] flex items-center gap-1 cursor-pointer"
                            >
                              <span>Practice Lab</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Official Chapter Quiz Banner if configured */}
                    {(() => {
                      const quiz = getQuizForChapter(quizzes, chapter.id);
                      if (!quiz || !quiz.isActive) return null;
                      return (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFF] to-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                              <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                              <span>Official Chapter Quiz ({quiz.platformName || 'Online Platform'})</span>
                              {quiz.timeLimitMinutes && (
                                <span className="text-[#64748B] font-normal">· {quiz.timeLimitMinutes} mins</span>
                              )}
                              {quiz.questionCount && (
                                <span className="text-[#64748B] font-normal">· {quiz.questionCount} questions</span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-[#111827]">
                              {quiz.title}
                            </div>
                            {quiz.description && (
                              <p className="text-[11px] text-[#475569]">{quiz.description}</p>
                            )}
                          </div>
                          <a
                            href={quiz.quizUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                          >
                            <span>Open Official Quiz</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* IN-PAGE PREVIEW MODAL FOR STUDENTS (FREE READING WITHOUT LOGIN) */}
      {previewSubConcept && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                  <span className="font-semibold text-[#2563EB]">
                    Class {previewSubConcept.chapter.classLevel}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{previewSubConcept.chapter.subjectId}</span>
                  <span>·</span>
                  <span>{previewSubConcept.chapter.title}</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827]">
                  {previewSubConcept.subConcept.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewSubConcept(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5FF] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                  Concept Overview
                </h4>
                <p className="text-sm text-[#475569] leading-relaxed">
                  {previewSubConcept.subConcept.explanation?.introduction ||
                    previewSubConcept.subConcept.shortDescription}
                </p>
              </div>

              {/* Learning Objectives */}
              {previewSubConcept.subConcept.learningObjectives && (
                <div className="bg-[#F8FAFF] p-4 rounded-xl border border-[#E2E8F0]">
                  <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Learning Objectives</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#475569]">
                    {previewSubConcept.subConcept.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#2563EB] font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Definitions */}
              {previewSubConcept.subConcept.explanation?.keyDefinitions && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Key Terminology &amp; Formulas
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {previewSubConcept.subConcept.explanation.keyDefinitions.map((def, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#FFFFFF] border border-[#BFDBFE] rounded-lg space-y-1"
                      >
                        <div className="text-xs font-bold text-[#2563EB]">{def.term}</div>
                        <div className="text-xs text-[#475569]">{def.definition}</div>
                        {def.formula && (
                          <div className="text-xs font-mono font-semibold text-[#111827] bg-[#EFF6FF] px-2 py-1 rounded inline-block mt-1">
                            {def.formula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Worked Examples Preview */}
              {previewSubConcept.subConcept.workedExamples &&
                previewSubConcept.subConcept.workedExamples.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Worked Solution Preview
                    </h4>
                    <div className="p-4 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] space-y-2">
                      <div className="text-xs font-semibold text-[#111827]">
                        Problem: {previewSubConcept.subConcept.workedExamples[0].problem}
                      </div>
                      <div className="space-y-1 pt-1">
                        {previewSubConcept.subConcept.workedExamples[0].steps.map((st) => (
                          <div key={st.stepNumber} className="text-xs text-[#475569]">
                            <span className="font-semibold text-[#2563EB]">
                              Step {st.stepNumber}: {st.title}
                            </span>
                            {st.math && (
                              <div className="font-mono bg-[#FFFFFF] border border-[#E2E8F0] px-2 py-0.5 rounded my-0.5 text-[#111827]">
                                {st.math}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#EDF2F7] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#64748B]">
                {isAuthenticated
                  ? 'Ready to practice in the interactive lab?'
                  : 'Log in to unlock full interactive labs & quiz tracking'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPreviewSubConcept(null)}
                  className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer flex-1 sm:flex-initial"
                >
                  Close Preview
                </button>

                <button
                  onClick={() => {
                    const chapterId = previewSubConcept.chapter.id;
                    const subId = previewSubConcept.subConcept.id;
                    setPreviewSubConcept(null);
                    handleAction(chapterId, subId);
                  }}
                  className="btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
                >
                  {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-blue-200" />}
                  <span>{isAuthenticated ? 'Open Interactive Lab' : 'Login to Practice'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
