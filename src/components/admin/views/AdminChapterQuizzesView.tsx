import React, { useState, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Edit2,
  Eye,
  Check,
  Globe,
  Clock,
  Layers,
  BookOpen,
  Filter,
  Sparkles,
  RefreshCw,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ArrowRight
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { ClassLevel, SubjectId, Concept, ChapterQuizLink } from '../../../types/curriculum';
import { CURRICULUM_DATA, CLASS_METADATA } from '../../../data/curriculumData';
import {
  fetchChapterQuizzes,
  saveChapterQuiz,
  deleteChapterQuiz,
  toggleChapterQuizActive,
  validateQuizUrl,
  detectQuizPlatform
} from '../../../services/quizLinkService';

const PLATFORM_PRESETS = [
  'Quizizz',
  'Kahoot',
  'Google Forms',
  'Wordwall',
  'Quizlet',
  'Mentimeter',
  'Blooket',
  'Custom'
];

export function AdminChapterQuizzesView() {
  const { token } = useAdminAuth();

  // Data states
  const [quizzes, setQuizzes] = useState<ChapterQuizLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(8);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('mathematics');
  const [selectedConceptId, setSelectedConceptId] = useState<string>('c8-math-linear-eq');
  const [quizUrl, setQuizUrl] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [platformName, setPlatformName] = useState('Quizizz');
  const [description, setDescription] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>('15');
  const [questionCount, setQuestionCount] = useState<string>('10');
  const [isActive, setIsActive] = useState(true);

  // Filter & Search states
  const [filterClass, setFilterClass] = useState<'all' | ClassLevel>('all');
  const [filterSubject, setFilterSubject] = useState<'all' | SubjectId>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load live curriculum or fallback
  const [allConcepts, setAllConcepts] = useState<Concept[]>(CURRICULUM_DATA);

  // Load all quizzes from API / cache
  const loadQuizzes = async () => {
    setLoading(true);
    try {
      // Also fetch live concepts from curriculum
      const curRes = await fetch('/api/content/curriculum');
      if (curRes.ok) {
        const curData = await curRes.json();
        if (curData.concepts && curData.concepts.length > 0) {
          setAllConcepts(curData.concepts);
        }
      }

      const data = await fetchChapterQuizzes(token || undefined, true);
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [token]);

  // Available chapters for current class & subject in the form
  const availableChapters = useMemo(() => {
    return allConcepts.filter(
      (c) => c.classLevel === selectedClass && c.subjectId === selectedSubject
    );
  }, [allConcepts, selectedClass, selectedSubject]);

  // When class or subject changes, auto-select first available chapter if current is not in list
  useEffect(() => {
    if (availableChapters.length > 0) {
      const match = availableChapters.find((c) => c.id === selectedConceptId);
      if (!match) {
        setSelectedConceptId(availableChapters[0].id);
      }
    }
  }, [availableChapters, selectedConceptId]);

  // Check if selected chapter already has a quiz configured
  const existingQuizForSelectedChapter = useMemo(() => {
    return quizzes.find((q) => q.conceptId === selectedConceptId);
  }, [quizzes, selectedConceptId]);

  // Auto-fill suggested title and platform when chapter or URL changes
  const handleChapterChange = (conceptId: string) => {
    setSelectedConceptId(conceptId);
    const existing = quizzes.find((q) => q.conceptId === conceptId);
    if (existing) {
      // Pre-fill existing data
      setEditingId(existing.id);
      setQuizUrl(existing.quizUrl);
      setQuizTitle(existing.title);
      setPlatformName(existing.platformName || detectQuizPlatform(existing.quizUrl));
      setDescription(existing.description || '');
      setTimeLimitMinutes(existing.timeLimitMinutes ? String(existing.timeLimitMinutes) : '15');
      setQuestionCount(existing.questionCount ? String(existing.questionCount) : '10');
      setIsActive(existing.isActive);
    } else {
      const ch = allConcepts.find((c) => c.id === conceptId);
      setEditingId(null);
      setQuizTitle(ch ? `${ch.title} Online Mastery Quiz` : '');
      setQuizUrl('');
      setDescription(`Test your understanding of ${ch?.title || 'this chapter'} with instant scoring.`);
      setTimeLimitMinutes('15');
      setQuestionCount('10');
      setIsActive(true);
    }
  };

  const handleUrlChange = (val: string) => {
    setQuizUrl(val);
    const detected = detectQuizPlatform(val);
    if (detected !== 'External Quiz') {
      setPlatformName(detected);
    }
  };

  // Pre-fill form when clicking "Edit" in the table
  const handleEditClick = (quiz: ChapterQuizLink) => {
    setEditingId(quiz.id);
    setSelectedClass(quiz.classLevel);
    setSelectedSubject(quiz.subjectId);
    setSelectedConceptId(quiz.conceptId);
    setQuizUrl(quiz.quizUrl);
    setQuizTitle(quiz.title);
    setPlatformName(quiz.platformName || detectQuizPlatform(quiz.quizUrl));
    setDescription(quiz.description || '');
    setTimeLimitMinutes(quiz.timeLimitMinutes ? String(quiz.timeLimitMinutes) : '15');
    setQuestionCount(quiz.questionCount ? String(quiz.questionCount) : '10');
    setIsActive(quiz.isActive);

    // Scroll smoothly to form
    const formEl = document.getElementById('quiz-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setQuizUrl('');
    const ch = allConcepts.find((c) => c.id === selectedConceptId);
    setQuizTitle(ch ? `${ch.title} Online Mastery Quiz` : '');
    setPlatformName('Quizizz');
    setDescription('');
    setTimeLimitMinutes('15');
    setQuestionCount('10');
    setIsActive(true);
    setFeedback(null);
  };

  // Submit Handler
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate URL
    const urlValidation = validateQuizUrl(quizUrl);
    if (!urlValidation.valid) {
      setFeedback({ type: 'error', message: urlValidation.error || 'Please enter a valid URL.' });
      return;
    }

    const currentConcept = allConcepts.find((c) => c.id === selectedConceptId);
    const chapterTitle = currentConcept?.title || 'Selected Chapter';

    setSaving(true);
    try {
      const saved = await saveChapterQuiz(
        {
          id: editingId || undefined,
          classLevel: selectedClass,
          subjectId: selectedSubject,
          conceptId: selectedConceptId,
          chapterTitle,
          title: quizTitle.trim() || `${chapterTitle} Online Quiz`,
          quizUrl: quizUrl.trim(),
          platformName: platformName.trim() || detectQuizPlatform(quizUrl),
          description: description.trim(),
          timeLimitMinutes: timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : undefined,
          questionCount: questionCount ? parseInt(questionCount, 10) : undefined,
          isActive
        },
        token || undefined
      );

      setFeedback({
        type: 'success',
        message: `Quiz link for "${chapterTitle}" saved and updated successfully! Students will now see this at the end of the chapter.`
      });

      // Refresh list
      await loadQuizzes();
      if (!editingId) {
        handleResetForm();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save quiz link. Please check the information and try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (quiz: ChapterQuizLink) => {
    try {
      await toggleChapterQuizActive(quiz.id, token || undefined);
      await loadQuizzes();
      setFeedback({
        type: 'success',
        message: `Quiz link "${quiz.title}" is now ${!quiz.isActive ? 'Active' : 'Disabled'}.`
      });
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quiz: ChapterQuizLink) => {
    if (!window.confirm(`Are you sure you want to remove the external quiz for "${quiz.chapterTitle || quiz.title}"?`)) {
      return;
    }
    try {
      await deleteChapterQuiz(quiz.id, token || undefined);
      await loadQuizzes();
      if (editingId === quiz.id) {
        handleResetForm();
      }
      setFeedback({
        type: 'success',
        message: `External quiz link for "${quiz.chapterTitle || quiz.title}" was removed.`
      });
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  // Copy link
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered quizzes for the table
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      if (filterClass !== 'all' && q.classLevel !== filterClass) return false;
      if (filterSubject !== 'all' && q.subjectId !== filterSubject) return false;
      if (filterStatus === 'active' && !q.isActive) return false;
      if (filterStatus === 'inactive' && q.isActive) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesChapter = (q.chapterTitle || '').toLowerCase().includes(query);
        const matchesUrl = q.quizUrl.toLowerCase().includes(query);
        const matchesPlatform = (q.platformName || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesChapter && !matchesUrl && !matchesPlatform) {
          return false;
        }
      }
      return true;
    });
  }, [quizzes, filterClass, filterSubject, filterStatus, searchQuery]);

  // Statistics
  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter((q) => q.isActive).length;
  const coveragePercent = allConcepts.length > 0 ? Math.round((totalQuizzes / allConcepts.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Interactive Assessment Integration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
            External Chapter Quiz Links
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Configure external quiz website URLs (Quizizz, Kahoot, Google Forms, Wordwall, etc.) for every chapter in Classes 6–10. Links automatically appear in the student interface when completing a chapter.
          </p>
        </div>

        <button
          onClick={() => {
            handleResetForm();
            const formEl = document.getElementById('quiz-form-card');
            if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="btn-primary px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Quiz Link</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Configured</span>
            <Globe className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#111827] mt-1">{totalQuizzes}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Across Science &amp; Math</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Quizzes</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#16A34A] mt-1">{activeQuizzes}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Visible to students</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Chapter Coverage</span>
            <Layers className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0284C7] mt-1">{coveragePercent}%</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">{totalQuizzes} of {allConcepts.length} chapters covered</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Supported Platforms</span>
            <Sparkles className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-sm font-bold text-[#111827] mt-2 truncate">
            Quizizz · Kahoot · Forms
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Any direct web link</div>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]'
              : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* FORM CARD */}
      <div
        id="quiz-form-card"
        className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs">
              {editingId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">
                {editingId ? 'Edit Chapter Quiz Link' : 'Add External Quiz Website Link'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {editingId
                  ? 'Update the external URL or student instructions for this chapter.'
                  : 'Select Class, Subject, and Chapter, then input the verified external quiz URL.'}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              onClick={handleResetForm}
              className="text-xs text-[#64748B] hover:text-[#2563EB] font-semibold underline cursor-pointer"
            >
              Cancel Edit &amp; Create New
            </button>
          )}
        </div>

        <form onSubmit={handleSaveQuiz} className="space-y-5">
          {/* Target Chapter Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Class Selection */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Target Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value) as ClassLevel)}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              >
                {CLASS_METADATA.map((c) => (
                  <option key={c.level} value={c.level}>
                    Class {c.level} ({c.title})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Subject Selection */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as SubjectId)}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              >
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
              </select>
            </div>

            {/* 3. Chapter Selection */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5 flex items-center justify-between">
                <span>Chapter *</span>
                {existingQuizForSelectedChapter && !editingId && (
                  <span className="text-[10px] text-[#D97706] font-semibold">Has existing link</span>
                )}
              </label>
              <select
                value={selectedConceptId}
                onChange={(e) => handleChapterChange(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              >
                {availableChapters.map((ch) => {
                  const hasQuiz = quizzes.some((q) => q.conceptId === ch.id);
                  return (
                    <option key={ch.id} value={ch.id}>
                      {ch.title} {hasQuiz ? '★ (Configured)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* External Quiz URL Input with Test Link */}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5 flex items-center justify-between">
              <span>External Quiz Website URL *</span>
              {quizUrl && (
                <a
                  href={quizUrl.startsWith('http') ? quizUrl : `https://${quizUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Test Link in New Tab</span>
                </a>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={quizUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://quizizz.com/join?gc=... or https://kahoot.it/... or Google Form URL"
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-mono"
                required
              />
              <Globe className="w-4 h-4 text-[#64748B] absolute left-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Supports any standard web URL. When students click this at the end of the chapter, it opens directly in their browser.
            </p>
          </div>

          {/* Quiz Title & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Display Title for Students *
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g. Linear Equations Kahoot Challenge"
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Quiz Platform / Provider
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="e.g. Quizizz, Kahoot, Google Forms"
                  className="flex-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PLATFORM_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatformName(p)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      platformName.toLowerCase() === p.toLowerCase()
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFF] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5FF]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description / Instructions */}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Instructions &amp; Guidance for Students (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 15 questions testing equation balancing. Aim for at least 80% score to master this topic!"
              rows={2}
              className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Duration, Questions & Active Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Time Limit (mins)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                placeholder="15"
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Question Count
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                placeholder="10"
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Publication Status
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]'
                    : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]'
                }`}
              >
                <span>{isActive ? 'Active (Live on Chapter)' : 'Disabled (Hidden)'}</span>
                {isActive ? (
                  <ToggleRight className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-[#94A3B8]" />
                )}
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDF2F7]">
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Quiz Link...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? 'Update Quiz Link' : 'Save & Publish Quiz Link'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by chapter, quiz title, platform, or URL..."
              className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Class filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value === 'all' ? 'all' : (Number(e.target.value) as ClassLevel))}
              className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-medium text-[#111827] focus:outline-none"
            >
              <option value="all">All Classes</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>

            {/* Subject filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value as any)}
              className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-medium text-[#111827] focus:outline-none"
            >
              <option value="all">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-medium text-[#111827] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
            </select>

            <button
              onClick={loadQuizzes}
              className="btn-secondary p-2 rounded-xl text-[#475569] hover:text-[#111827] cursor-pointer"
              title="Refresh Quizzes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* QUIZZES LIST TABLE / CARDS */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#EDF2F7] flex items-center justify-between text-xs text-[#64748B]">
          <span className="font-bold text-[#111827]">
            Configured Chapter Quizzes ({filteredQuizzes.length})
          </span>
          <span>Changes reflect immediately in the student chapter view</span>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Globe className="w-10 h-10 text-[#94A3B8] mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-[#111827]">
              {quizzes.length === 0
                ? 'No quiz links added yet'
                : 'No quiz links match your search or filter'}
            </h4>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              {quizzes.length === 0
                ? 'All quizzes have been removed from the public website. Use the form above to add an external quiz link (e.g. Quizizz, Kahoot, Google Forms) for any chapter. Once added, it will immediately appear on the website.'
                : 'Use the form above to add a quiz link for any chapter, or reset your filters to view all entries.'}
            </p>
            {quizzes.length > 0 && (
              <button
                onClick={() => {
                  setFilterClass('all');
                  setFilterSubject('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="btn-secondary px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#EDF2F7]">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 hover:bg-[#F8FAFF] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-[#EFF6FF] text-[#2563EB] font-bold px-2.5 py-0.5 rounded-md border border-[#BFDBFE]">
                      Class {quiz.classLevel}
                    </span>
                    <span className="bg-[#F1F5FF] text-[#475569] font-semibold px-2 py-0.5 rounded-md capitalize">
                      {quiz.subjectId}
                    </span>
                    <span className="bg-[#FEF3C7] text-[#92400E] font-bold px-2 py-0.5 rounded-md border border-[#FDE68A]">
                      {quiz.platformName || 'External Quiz'}
                    </span>
                    {quiz.timeLimitMinutes && (
                      <span className="text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quiz.timeLimitMinutes} mins
                      </span>
                    )}
                    {quiz.questionCount && (
                      <span className="text-[#64748B]">
                        · {quiz.questionCount} questions
                      </span>
                    )}
                  </div>

                  {/* Chapter & Quiz Title */}
                  <div>
                    <div className="text-xs font-semibold text-[#64748B]">
                      Chapter: <span className="text-[#111827]">{quiz.chapterTitle || 'Selected Chapter'}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#111827] mt-0.5">
                      {quiz.title}
                    </h4>
                  </div>

                  {/* URL */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#2563EB] break-all">
                    <Globe className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                    <a
                      href={quiz.quizUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>{quiz.quizUrl}</span>
                      <ExternalLink className="w-3 h-3 inline shrink-0" />
                    </a>
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                  {/* Status button */}
                  <button
                    onClick={() => handleToggleStatus(quiz)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                      quiz.isActive
                        ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                        : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
                    }`}
                    title="Click to toggle live visibility"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        quiz.isActive ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'
                      }`}
                    />
                    <span>{quiz.isActive ? 'Active' : 'Disabled'}</span>
                  </button>

                  {/* Copy URL */}
                  <button
                    onClick={() => handleCopyLink(quiz.quizUrl, quiz.id)}
                    className="p-2 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5FF] border border-[#E2E8F0] cursor-pointer"
                    title="Copy Quiz URL"
                  >
                    {copiedId === quiz.id ? (
                      <Check className="w-4 h-4 text-[#16A34A]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEditClick(quiz)}
                    className="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="p-2 rounded-lg text-[#DC2626] hover:bg-[#FEE2E2] border border-[#FCA5A5] cursor-pointer"
                    title="Remove Quiz Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
