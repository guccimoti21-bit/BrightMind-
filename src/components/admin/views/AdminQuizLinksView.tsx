import React, { useState, useEffect, useMemo } from 'react';
import {
  Link2,
  ExternalLink,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Copy,
  Check,
  Globe,
  Sparkles,
  BookOpen,
  Layers,
  ArrowUpRight,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { ChapterQuizLink, QuizPlatform } from '../../../types/quizLink';
import { ClassLevel, SubjectId, Concept } from '../../../types/curriculum';
import {
  fetchAdminQuizLinks,
  saveAdminQuizLink,
  updateAdminQuizLink,
  deleteAdminQuizLink,
  validateQuizUrl
} from '../../../services/quizLinkService';

const PLATFORMS: { name: QuizPlatform; color: string; placeholder: string }[] = [
  { name: 'Quizizz', color: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]', placeholder: 'https://quizizz.com/join/quiz/...' },
  { name: 'Kahoot!', color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', placeholder: 'https://kahoot.it/challenge/...' },
  { name: 'Google Forms', color: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]', placeholder: 'https://forms.gle/...' },
  { name: 'NCERT Official', color: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', placeholder: 'https://ncert.nic.in/quiz/...' },
  { name: 'Quizlet', color: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]', placeholder: 'https://quizlet.com/...' },
  { name: 'Mentimeter', color: 'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]', placeholder: 'https://www.menti.com/...' },
  { name: 'Testmoz', color: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]', placeholder: 'https://testmoz.com/...' },
  { name: 'Custom', color: 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]', placeholder: 'https://...' }
];

export function AdminQuizLinksView() {
  const { token } = useAdminAuth();

  const [quizLinks, setQuizLinks] = useState<ChapterQuizLink[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'configured' | 'missing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ChapterQuizLink | null>(null);

  // Form State
  const [formClassLevel, setFormClassLevel] = useState<ClassLevel>(8);
  const [formSubjectId, setFormSubjectId] = useState<SubjectId>('mathematics');
  const [formChapterId, setFormChapterId] = useState<string>('');
  const [formQuizUrl, setFormQuizUrl] = useState('');
  const [formQuizTitle, setFormQuizTitle] = useState('');
  const [formPlatform, setFormPlatform] = useState<QuizPlatform>('Quizizz');
  const [formDescription, setFormDescription] = useState('');
  const [formOpenInNewTab, setFormOpenInNewTab] = useState(true);

  // Form validation & status
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clipboard copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<ChapterQuizLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Quiz Links and Concepts from API
  const loadData = async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const [linksData, conceptsRes] = await Promise.all([
        fetchAdminQuizLinks(token),
        fetch('/api/admin/concepts', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setQuizLinks(linksData);

      if (conceptsRes.ok) {
        const conceptsData = await conceptsRes.json();
        setConcepts(conceptsData);
      }
    } catch (e) {
      console.error('Failed loading quiz links data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Available chapters for the selected Class & Subject in the modal form
  const availableChapters = useMemo(() => {
    return concepts.filter(
      (c) => c.classLevel === formClassLevel && c.subjectId === formSubjectId
    );
  }, [concepts, formClassLevel, formSubjectId]);

  // Update selected chapter when class or subject changes in form
  useEffect(() => {
    if (!editingLink) {
      if (availableChapters.length > 0) {
        const alreadyHasSelected = availableChapters.some((c) => c.id === formChapterId);
        if (!alreadyHasSelected) {
          setFormChapterId(availableChapters[0].id);
        }
      } else {
        setFormChapterId('');
      }
    }
  }, [availableChapters, formChapterId, editingLink]);

  // When chapter changes in the form, check if a link already exists and optionally prefill
  const handleChapterChange = (chapterId: string) => {
    setFormChapterId(chapterId);
    if (!editingLink) {
      const existing = quizLinks.find((l) => l.chapterId === chapterId);
      if (existing) {
        setFormQuizUrl(existing.quizUrl);
        setFormQuizTitle(existing.quizTitle || '');
        setFormPlatform((existing.platform as QuizPlatform) || 'Quizizz');
        setFormDescription(existing.description || '');
        setFormOpenInNewTab(existing.openInNewTab !== false);
      } else {
        const chapterObj = concepts.find((c) => c.id === chapterId);
        if (chapterObj) {
          setFormQuizTitle(`${chapterObj.title} Mastery Quiz`);
        }
      }
    }
  };

  // URL validation status for the form input
  const urlValidation = useMemo(() => {
    if (!formQuizUrl.trim()) return { touched: false, valid: false };
    const res = validateQuizUrl(formQuizUrl);
    return { touched: true, valid: res.valid, error: res.error, normalized: res.normalized };
  }, [formQuizUrl]);

  // Open modal to add a quiz link for a specific chapter
  const handleOpenAddModal = (chapter?: Concept) => {
    setEditingLink(null);
    setFormError(null);
    setFormSuccess(null);

    if (chapter) {
      setFormClassLevel(chapter.classLevel);
      setFormSubjectId(chapter.subjectId);
      setFormChapterId(chapter.id);
      setFormQuizTitle(`${chapter.title} Online Quiz`);
      setFormQuizUrl('');
      setFormPlatform('Quizizz');
      setFormDescription(`Complete the end-of-chapter quiz for ${chapter.title}. Target passing score is 80%.`);
      setFormOpenInNewTab(true);
    } else {
      setFormClassLevel(8);
      setFormSubjectId('mathematics');
      const firstChap = concepts.find((c) => c.classLevel === 8 && c.subjectId === 'mathematics');
      setFormChapterId(firstChap?.id || '');
      setFormQuizTitle(firstChap ? `${firstChap.title} Online Quiz` : '');
      setFormQuizUrl('');
      setFormPlatform('Quizizz');
      setFormDescription('');
      setFormOpenInNewTab(true);
    }

    setIsModalOpen(true);
  };

  // Open modal to edit an existing quiz link
  const handleOpenEditModal = (link: ChapterQuizLink) => {
    setEditingLink(link);
    setFormError(null);
    setFormSuccess(null);
    setFormClassLevel(link.classLevel);
    setFormSubjectId(link.subjectId);
    setFormChapterId(link.chapterId);
    setFormQuizUrl(link.quizUrl);
    setFormQuizTitle(link.quizTitle || `${link.chapterTitle} Online Quiz`);
    setFormPlatform((link.platform as QuizPlatform) || 'Custom');
    setFormDescription(link.description || '');
    setFormOpenInNewTab(link.openInNewTab !== false);
    setIsModalOpen(true);
  };

  // Submit form (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formChapterId) {
      setFormError('Please select a chapter.');
      return;
    }

    const validation = validateQuizUrl(formQuizUrl);
    if (!validation.valid || !validation.normalized) {
      setFormError(validation.error || 'Please provide a valid website URL.');
      return;
    }

    const chapterObj = concepts.find((c) => c.id === formChapterId);
    const chapterTitle = chapterObj?.title || editingLink?.chapterTitle || `Chapter (${formChapterId})`;

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingLink) {
        const res = await updateAdminQuizLink(token, editingLink.id, {
          classLevel: formClassLevel,
          subjectId: formSubjectId,
          chapterId: formChapterId,
          chapterTitle,
          quizUrl: validation.normalized,
          quizTitle: formQuizTitle.trim() || `${chapterTitle} Quiz`,
          platform: formPlatform,
          description: formDescription.trim(),
          openInNewTab: formOpenInNewTab
        });

        if (res.success && res.data) {
          setQuizLinks((prev) => prev.map((l) => (l.id === editingLink.id ? res.data! : l)));
          setFormSuccess('Quiz link updated successfully!');
          setTimeout(() => {
            setIsModalOpen(false);
          }, 600);
        } else {
          setFormError(res.error || 'Failed to update quiz link.');
        }
      } else {
        const res = await saveAdminQuizLink(token, {
          classLevel: formClassLevel,
          subjectId: formSubjectId,
          chapterId: formChapterId,
          chapterTitle,
          quizUrl: validation.normalized,
          quizTitle: formQuizTitle.trim() || `${chapterTitle} Quiz`,
          platform: formPlatform,
          description: formDescription.trim(),
          openInNewTab: formOpenInNewTab
        });

        if (res.success && res.data) {
          setQuizLinks((prev) => {
            const filtered = prev.filter((l) => l.chapterId !== formChapterId);
            return [res.data!, ...filtered];
          });
          setFormSuccess('Quiz link saved and published to student interface!');
          setTimeout(() => {
            setIsModalOpen(false);
          }, 600);
        } else {
          setFormError(res.error || 'Failed to save quiz link.');
        }
      }
    } catch (e: any) {
      setFormError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Link
  const handleConfirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminQuizLink(token, deleteTarget.id);
      if (res.success) {
        setQuizLinks((prev) => prev.filter((l) => l.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (e) {
      console.error('Delete error', e);
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (linkId: string, url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Test URL in browser
  const handleTestUrl = (url: string) => {
    const val = validateQuizUrl(url);
    const targetUrl = val.normalized || url;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Compute table entries: Each chapter in concepts paired with its quiz link (if any)
  const chapterRows = useMemo(() => {
    const map = new Map<string, ChapterQuizLink>();
    quizLinks.forEach((l) => {
      map.set(l.chapterId, l);
    });

    return concepts.map((concept) => {
      const link = map.get(concept.id);
      return {
        concept,
        link,
        hasLink: Boolean(link)
      };
    });
  }, [concepts, quizLinks]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return chapterRows.filter(({ concept, link, hasLink }) => {
      if (selectedClass !== 'all' && concept.classLevel !== selectedClass) {
        return false;
      }
      if (selectedSubject !== 'all' && concept.subjectId !== selectedSubject) {
        return false;
      }
      if (selectedStatus === 'configured' && !hasLink) {
        return false;
      }
      if (selectedStatus === 'missing' && hasLink) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = concept.title.toLowerCase().includes(q);
        const matchCategory = concept.category?.toLowerCase().includes(q);
        const matchQuizTitle = link?.quizTitle?.toLowerCase().includes(q) || false;
        const matchUrl = link?.quizUrl.toLowerCase().includes(q) || false;
        const matchPlatform = link?.platform?.toLowerCase().includes(q) || false;
        return matchTitle || matchCategory || matchQuizTitle || matchUrl || matchPlatform;
      }
      return true;
    });
  }, [chapterRows, selectedClass, selectedSubject, selectedStatus, searchQuery]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalChapters = concepts.length;
    const configuredCount = chapterRows.filter((r) => r.hasLink).length;
    const missingCount = totalChapters - configuredCount;
    const coveragePercent = totalChapters > 0 ? Math.round((configuredCount / totalChapters) * 100) : 0;
    const totalClicks = quizLinks.reduce((acc, l) => acc + (l.clickCount || 0), 0);

    return {
      totalChapters,
      configuredCount,
      missingCount,
      coveragePercent,
      totalClicks
    };
  }, [concepts, chapterRows, quizLinks]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[#64748B]">Loading Chapter Quiz Links Manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-[#FFFFFF] border border-[#BFDBFE] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Link2 className="w-4 h-4" />
            <span>Curriculum &amp; Assessment Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            External Quiz Website Links
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1.5 max-w-2xl leading-relaxed">
            Attach, configure, and monitor external quiz URLs (Kahoot!, Quizizz, Google Forms, NCERT Official) for every chapter across Classes 6–10. Links automatically activate at the conclusion of each chapter in the student interface.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] transition-colors cursor-pointer"
            title="Refresh links"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Quiz Link</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Chapters */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-1">
            <span>Total Chapters</span>
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#111827]">{stats.totalChapters}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Classes 6 to 10 (Sci &amp; Math)</div>
        </div>

        {/* Quizzes Configured */}
        <div className="bg-[#FFFFFF] border border-[#BBF7D0] rounded-2xl p-4 shadow-sm bg-gradient-to-br from-[#FFFFFF] to-[#F0FDF4]">
          <div className="flex items-center justify-between text-xs text-[#15803D] font-semibold mb-1">
            <span>Configured</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#15803D]">{stats.configuredCount}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-[#DCFCE7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#16A34A] rounded-full transition-all"
                style={{ width: `${stats.coveragePercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#16A34A]">
              {stats.coveragePercent}%
            </span>
          </div>
        </div>

        {/* Needs Link */}
        <div className="bg-[#FFFFFF] border border-[#FDE68A] rounded-2xl p-4 shadow-sm bg-gradient-to-br from-[#FFFFFF] to-[#FFFBEB]">
          <div className="flex items-center justify-between text-xs text-[#B45309] font-semibold mb-1">
            <span>Pending Links</span>
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#B45309]">{stats.missingCount}</div>
          <div className="text-[11px] text-[#92400E] mt-0.5">Chapters missing URL</div>
        </div>

        {/* Total Clicks */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-1">
            <span>Student Clicks</span>
            <ArrowUpRight className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#111827]">{stats.totalClicks}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">External quiz launches</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters, platforms, or quiz URLs..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="all">All Classes (6–10)</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="all">All Subjects</option>
              <option value="science">Science</option>
              <option value="mathematics">Mathematics</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="all">All Statuses</option>
              <option value="configured">Configured Only</option>
              <option value="missing">Missing Quiz Link</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Class &amp; Subject</th>
                <th className="py-3.5 px-4">Chapter Title</th>
                <th className="py-3.5 px-4">Quiz Status</th>
                <th className="py-3.5 px-4">Platform &amp; Quiz Title</th>
                <th className="py-3.5 px-4">External URL</th>
                <th className="py-3.5 px-4 text-center">Clicks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#64748B]">
                    No chapters match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ concept, link, hasLink }) => {
                  const isMath = concept.subjectId === 'mathematics';
                  return (
                    <tr
                      key={concept.id}
                      className="hover:bg-[#F8FAFF] transition-colors"
                    >
                      {/* Class & Subject */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#111827] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                            Class {concept.classLevel}
                          </span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] capitalize ${
                              isMath
                                ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                                : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                            }`}
                          >
                            {concept.subjectId}
                          </span>
                        </div>
                      </td>

                      {/* Chapter Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#111827] leading-snug">{concept.title}</div>
                        <div className="text-[11px] text-[#64748B]">{concept.category} · {concept.subConcepts?.length || 0} sub-concepts</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasLink ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Quiz</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>No Link</span>
                          </span>
                        )}
                      </td>

                      {/* Platform & Quiz Title */}
                      <td className="py-3.5 px-4">
                        {hasLink && link ? (
                          <div>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] mb-0.5">
                              {link.platform || 'Custom'}
                            </span>
                            <div className="font-semibold text-[#111827] truncate max-w-[200px]" title={link.quizTitle}>
                              {link.quizTitle || 'Chapter Online Quiz'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">Unassigned</span>
                        )}
                      </td>

                      {/* External URL */}
                      <td className="py-3.5 px-4">
                        {hasLink && link ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={link.quizUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-[#2563EB] hover:underline truncate max-w-[180px] inline-block"
                              title={link.quizUrl}
                            >
                              {link.quizUrl}
                            </a>
                            <button
                              onClick={() => handleCopyUrl(link.id, link.quizUrl)}
                              className="p-1 text-[#94A3B8] hover:text-[#111827] rounded transition-colors"
                              title="Copy URL"
                            >
                              {copiedId === link.id ? (
                                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleTestUrl(link.quizUrl)}
                              className="p-1 text-[#94A3B8] hover:text-[#2563EB] rounded transition-colors"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">—</span>
                        )}
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {hasLink && link ? (
                          <span className="font-mono font-bold text-[#111827] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">
                            {link.clickCount || 0}
                          </span>
                        ) : (
                          <span className="text-[#CBD5E1]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {hasLink && link ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(link)}
                              className="px-2.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Edit Quiz Link"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => setDeleteTarget(link)}
                              className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                              title="Remove Quiz Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAddModal(concept)}
                            className="px-3 py-1.5 bg-[#F1F5FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-[#BFDBFE]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Link</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Quiz Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    {editingLink ? 'Edit External Quiz Link' : 'Add External Quiz Link'}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Configure the destination quiz URL for students to take upon finishing this chapter.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#111827] rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Messages */}
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-xs text-[#15803D] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Class & Subject Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Class Level <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={formClassLevel}
                    disabled={Boolean(editingLink)}
                    onChange={(e) => setFormClassLevel(Number(e.target.value) as ClassLevel)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
                  >
                    <option value={6}>Class 6</option>
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Subject <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={formSubjectId}
                    disabled={Boolean(editingLink)}
                    onChange={(e) => setFormSubjectId(e.target.value as SubjectId)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
                  >
                    <option value="science">Science</option>
                    <option value="mathematics">Mathematics</option>
                  </select>
                </div>
              </div>

              {/* Chapter Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Chapter <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formChapterId}
                  disabled={Boolean(editingLink)}
                  onChange={(e) => handleChapterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
                >
                  {availableChapters.length === 0 ? (
                    <option value="">No chapters found for this class &amp; subject</option>
                  ) : (
                    availableChapters.map((c) => {
                      const hasExisting = quizLinks.some((l) => l.chapterId === c.id);
                      return (
                        <option key={c.id} value={c.id}>
                          {c.title} {hasExisting && !editingLink ? '(Link already configured)' : ''}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Platform Selector Buttons */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Quiz Platform / Provider
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const isSelected = formPlatform === p.name;
                    return (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => {
                          setFormPlatform(p.name);
                          if (!formQuizUrl && p.placeholder !== 'https://...') {
                            setFormQuizUrl(p.placeholder);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                            : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz URL Input with real-time validation & test button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#374151]">
                    External Quiz Website URL <span className="text-[#DC2626]">*</span>
                  </label>
                  {urlValidation.touched && (
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        urlValidation.valid ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}
                    >
                      {urlValidation.valid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valid URL</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Invalid format</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formQuizUrl}
                    onChange={(e) => setFormQuizUrl(e.target.value)}
                    placeholder="https://quizizz.com/join/quiz/... or https://forms.gle/..."
                    className={`w-full pl-3.5 pr-24 py-2.5 bg-[#F8FAFC] border rounded-xl text-xs font-mono text-[#111827] focus:bg-white focus:outline-none focus:ring-2 ${
                      urlValidation.touched && !urlValidation.valid
                        ? 'border-[#FCA5A5] focus:ring-[#DC2626]/20'
                        : 'border-[#E2E8F0] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={!urlValidation.valid}
                    onClick={() => handleTestUrl(formQuizUrl)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Students clicking this link at the end of the chapter will be securely directed to this quiz page in their browser.
                </p>
              </div>

              {/* Quiz Title */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Quiz Display Title
                </label>
                <input
                  type="text"
                  value={formQuizTitle}
                  onChange={(e) => setFormQuizTitle(e.target.value)}
                  placeholder="e.g. Linear Equations Mastery Challenge"
                  className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>

              {/* Optional Instructions */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Student Instructions / Guidelines (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 15 questions · Timed test · Pass score 80% · Have your notebook ready."
                  className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>

              {/* Open in New Tab Toggle */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  checked={formOpenInNewTab}
                  onChange={(e) => setFormOpenInNewTab(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded border-[#CBD5E1] focus:ring-[#2563EB]"
                />
                <label htmlFor="openInNewTab" className="text-xs font-semibold text-[#374151] cursor-pointer">
                  Open quiz link in a new browser tab (recommended for third-party platforms)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || (urlValidation.touched && !urlValidation.valid)}
                  className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingLink ? 'Update Quiz Link' : 'Save & Publish Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center text-[#DC2626] mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#111827] mb-1.5">Remove External Quiz Link?</h3>
            <p className="text-xs text-[#475569] leading-relaxed mb-5">
              Are you sure you want to remove the quiz link for <span className="font-bold text-[#111827]">Class {deleteTarget.classLevel} {deleteTarget.subjectId}</span> chapter <span className="font-bold text-[#111827]">"{deleteTarget.chapterTitle}"</span>?
              Students will no longer see this quiz button at the end of the chapter.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? 'Removing...' : 'Yes, Remove Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
