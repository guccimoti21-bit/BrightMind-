import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
  Layers,
  BookOpen,
  Filter,
  Sparkles,
  RefreshCw,
  Folder,
  Presentation,
  FileSpreadsheet,
  FileCheck,
  Play,
  ArrowUp,
  ArrowDown,
  X,
  Globe
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { ClassLevel, SubjectId, Concept, LearningResource, ResourceType } from '../../../types/curriculum';
import { CURRICULUM_DATA, CLASS_METADATA } from '../../../data/curriculumData';
import {
  fetchLearningResources,
  saveLearningResource,
  deleteLearningResource,
  toggleLearningResourceActive,
  reorderLearningResources,
  validateResourceUrl,
  parseGoogleDriveUrl,
  parseYouTubeUrl,
  decorateResource
} from '../../../services/learningResourceService';

export function AdminLearningResourcesView() {
  const { token } = useAdminAuth();

  // Data states
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<ResourceType>('google_drive');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(8);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('science');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('c8-sci-light');
  const [selectedSubConceptId, setSelectedSubConceptId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  // Filter & Search states
  const [filterClass, setFilterClass] = useState<'all' | ClassLevel>('all');
  const [filterSubject, setFilterSubject] = useState<'all' | SubjectId>('all');
  const [filterType, setFilterType] = useState<'all' | ResourceType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');
  const [filterChapterId, setFilterChapterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Preview modal state
  const [previewResource, setPreviewResource] = useState<LearningResource | null>(null);

  // Curriculum concepts list
  const [allConcepts, setAllConcepts] = useState<Concept[]>(CURRICULUM_DATA);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load resources and live curriculum
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live curriculum if available
      try {
        const curRes = await fetch('/api/content/curriculum');
        if (curRes.ok) {
          const curData = await curRes.json();
          if (curData.concepts && curData.concepts.length > 0) {
            setAllConcepts(curData.concepts);
          }
        }
      } catch (err) {
        // Fallback to static CURRICULUM_DATA
      }

      // 2. Fetch learning resources
      const items = await fetchLearningResources({ includeInactive: true }, token || undefined);
      setResources(items);
    } catch (err) {
      console.error('Failed loading learning resources:', err);
      setFeedback({ type: 'error', message: 'Failed to load learning resources.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Concepts matching current form class and subject
  const formAvailableChapters = useMemo(() => {
    return allConcepts.filter(
      (c) => c.classLevel === selectedClass && c.subjectId === selectedSubject
    );
  }, [allConcepts, selectedClass, selectedSubject]);

  // Sub-concepts matching currently selected form chapter
  const currentChapter = useMemo(() => {
    return allConcepts.find((c) => c.id === selectedChapterId);
  }, [allConcepts, selectedChapterId]);

  const formAvailableSubConcepts = useMemo(() => {
    return currentChapter ? currentChapter.subConcepts : [];
  }, [currentChapter]);

  // Keep selectedChapterId valid when class or subject changes in form
  useEffect(() => {
    if (formAvailableChapters.length > 0) {
      const exists = formAvailableChapters.some((c) => c.id === selectedChapterId);
      if (!exists) {
        setSelectedChapterId(formAvailableChapters[0].id);
        setSelectedSubConceptId('');
      }
    } else {
      setSelectedChapterId('');
      setSelectedSubConceptId('');
    }
  }, [formAvailableChapters]);

  // Live URL validation preview
  const liveUrlValidation = useMemo(() => {
    if (!resourceUrl.trim()) return null;
    return validateResourceUrl(resourceType, resourceUrl);
  }, [resourceType, resourceUrl]);

  // Live preview decoration
  const livePreviewData = useMemo(() => {
    if (!liveUrlValidation?.valid) return null;
    if (resourceType === 'google_drive') {
      return parseGoogleDriveUrl(resourceUrl);
    } else {
      return parseYouTubeUrl(resourceUrl);
    }
  }, [liveUrlValidation, resourceType, resourceUrl]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // Class filter
      if (filterClass !== 'all' && item.classLevel !== filterClass) return false;

      // Subject filter
      if (filterSubject !== 'all' && item.subject !== filterSubject) return false;

      // Type filter
      if (filterType !== 'all' && item.resourceType !== filterType) return false;

      // Status filter
      if (filterStatus === 'active' && !item.isActive) return false;
      if (filterStatus === 'hidden' && item.isActive) return false;

      // Chapter filter
      if (filterChapterId !== 'all' && item.chapterId !== filterChapterId) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = (item.description || '').toLowerCase().includes(query);
        const matchUrl = item.resourceUrl.toLowerCase().includes(query);
        const matchChapter = (item.chapterTitle || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchUrl && !matchChapter) return false;
      }

      return true;
    });
  }, [resources, filterClass, filterSubject, filterType, filterStatus, filterChapterId, searchQuery]);

  // Open Form for Adding New Resource
  const handleOpenAddForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setResourceUrl('');
    setResourceType('google_drive');
    setSelectedClass(8);
    setSelectedSubject('science');
    setSelectedChapterId('c8-sci-light');
    setSelectedSubConceptId('');
    setIsActive(true);
    setFeedback(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Resource
  const handleOpenEditForm = (item: LearningResource) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setResourceUrl(item.resourceUrl);
    setResourceType(item.resourceType);
    setSelectedClass(item.classLevel);
    setSelectedSubject(item.subject);
    setSelectedChapterId(item.chapterId);
    setSelectedSubConceptId(item.subConceptId || '');
    setIsActive(item.isActive);
    setFeedback(null);
    setIsFormOpen(true);
  };

  // Close Form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  // Submit Save
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Resource Title is required.' });
      return;
    }

    if (!resourceUrl.trim()) {
      setFeedback({ type: 'error', message: 'Resource URL is required.' });
      return;
    }

    const val = validateResourceUrl(resourceType, resourceUrl);
    if (!val.valid) {
      setFeedback({ type: 'error', message: val.error || 'Invalid resource URL.' });
      return;
    }

    if (!selectedChapterId) {
      setFeedback({ type: 'error', message: 'Please select an existing chapter from the curriculum.' });
      return;
    }

    setSaving(true);
    try {
      const chapterObj = allConcepts.find((c) => c.id === selectedChapterId);
      const subObj = chapterObj?.subConcepts.find((s) => s.id === selectedSubConceptId);

      const existingItem = editingId ? resources.find((r) => r.id === editingId) : undefined;

      const payload: Partial<LearningResource> = {
        id: editingId || undefined,
        title: title.trim(),
        description: description.trim(),
        resourceType,
        resourceUrl: val.normalizedUrl || resourceUrl.trim(),
        classLevel: selectedClass,
        subject: selectedSubject,
        chapterId: selectedChapterId,
        chapterTitle: chapterObj?.title || 'Chapter',
        subConceptId: selectedSubConceptId || undefined,
        subConceptTitle: subObj?.title || undefined,
        isActive,
        sortOrder: existingItem ? existingItem.sortOrder : resources.length,
        createdAt: existingItem ? existingItem.createdAt : undefined
      };

      const saved = await saveLearningResource(payload, token || undefined);

      if (editingId) {
        setResources((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
        setFeedback({ type: 'success', message: `Resource "${saved.title}" updated successfully.` });
      } else {
        setResources((prev) => [...prev, saved]);
        setFeedback({ type: 'success', message: `Resource "${saved.title}" created successfully.` });
      }

      setIsFormOpen(false);
      setEditingId(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save resource.' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Visibility
  const handleToggleActive = async (id: string) => {
    try {
      const updated = await toggleLearningResourceActive(id, token || undefined);
      if (updated) {
        setResources((prev) => prev.map((r) => (r.id === id ? updated : r)));
        setFeedback({
          type: 'success',
          message: `Resource "${updated.title}" is now ${updated.isActive ? 'Visible to students' : 'Hidden from students'}.`
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update visibility.' });
    }
  };

  // Delete Resource
  const handleDeleteResource = async (id: string) => {
    try {
      const success = await deleteLearningResource(id, token || undefined);
      if (success) {
        setResources((prev) => prev.filter((r) => r.id !== id));
        setDeletingId(null);
        setFeedback({ type: 'success', message: 'Resource deleted permanently.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to delete resource.' });
    }
  };

  // Reorder Item (Up or Down)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredResources.length) return;

    const list = [...filteredResources];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const orderedIds = list.map((item) => item.id);

    // Optimistically update local view
    const updatedAll = resources.map((item) => {
      const newIdx = orderedIds.indexOf(item.id);
      return newIdx >= 0 ? { ...item, sortOrder: newIdx } : item;
    });
    setResources(updatedAll.sort((a, b) => a.sortOrder - b.sortOrder));

    try {
      await reorderLearningResources(orderedIds, token || undefined);
    } catch (err) {
      console.warn('Reorder synchronization notice:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Learning Resources Manager
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Curate verified Google Drive files, PDFs, presentations, and YouTube video tutorials for Classes 6–10.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Refresh resources list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAddForm}
            className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Class Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Class Level</label>
            <select
              value={filterClass}
              onChange={(e) =>
                setFilterClass(e.target.value === 'all' ? 'all' : (Number(e.target.value) as ClassLevel))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Classes (6–10)</option>
              {CLASS_METADATA.map((c) => (
                <option key={c.level} value={c.level}>
                  Class {c.level}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) =>
                setFilterSubject(e.target.value === 'all' ? 'all' : (e.target.value as SubjectId))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium capitalize"
            >
              <option value="all">All Subjects</option>
              <option value="science">Science</option>
              <option value="mathematics">Mathematics</option>
            </select>
          </div>

          {/* Resource Type Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Resource Type</label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value === 'all' ? 'all' : (e.target.value as ResourceType))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Types</option>
              <option value="google_drive">Google Drive</option>
              <option value="youtube">YouTube Video</option>
            </select>
          </div>

          {/* Visibility Status Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Visibility</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Visible to Students</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Specific Chapter Filter */}
          <div className="lg:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Specific Chapter</label>
            <select
              value={filterChapterId}
              onChange={(e) => setFilterChapterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Chapters</option>
              {allConcepts.map((c) => (
                <option key={c.id} value={c.id}>
                  Class {c.classLevel} - {c.subjectId === 'science' ? 'Sci' : 'Math'}: {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by title, description, URL, or chapter name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500 font-medium">Total Resources</div>
          <div className="text-xl font-black text-slate-900 mt-1">{resources.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500 font-medium">Google Drive Files</div>
          <div className="text-xl font-black text-blue-600 mt-1">
            {resources.filter((r) => r.resourceType === 'google_drive').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500 font-medium">YouTube Videos</div>
          <div className="text-xl font-black text-rose-600 mt-1">
            {resources.filter((r) => r.resourceType === 'youtube').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500 font-medium">Active (Visible)</div>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {resources.filter((r) => r.isActive).length}
          </div>
        </div>
      </div>

      {/* Create / Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  {resourceType === 'google_drive' ? <Folder className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Learning Resource' : 'Add New Learning Resource'}
                </h2>
              </div>
              <button
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 space-y-4 text-xs">
              {/* Resource Type Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Resource Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResourceType('google_drive')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      resourceType === 'google_drive'
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Folder className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold">Google Drive</div>
                      <div className="text-[11px] text-slate-500 font-normal">PDFs, Docs, Slides, Folders</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResourceType('youtube')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      resourceType === 'youtube'
                        ? 'border-rose-500 bg-rose-50/60 text-rose-900 ring-2 ring-rose-500/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold">YouTube Video</div>
                      <div className="text-[11px] text-slate-500 font-normal">Tutorials, Shorts, Playlists</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Resource Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    resourceType === 'google_drive'
                      ? 'e.g., NCERT Class 8 Light Handwritten Revision Notes'
                      : 'e.g., Practical Demonstration of Laws of Reflection (Ray Optics)'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                />
              </div>

              {/* URL Input */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {resourceType === 'google_drive' ? 'Google Drive / Docs URL' : 'YouTube URL'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder={
                    resourceType === 'google_drive'
                      ? 'https://drive.google.com/file/d/.../view or https://docs.google.com/presentation/d/...'
                      : 'https://www.youtube.com/watch?v=... or https://youtu.be/... or playlist link'
                  }
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono text-xs"
                />

                {/* Live URL Validation Feedback */}
                {liveUrlValidation && (
                  <div className="mt-1.5">
                    {liveUrlValidation.valid ? (
                      <div className="text-emerald-600 text-[11px] flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Valid {resourceType === 'google_drive' ? 'Google Drive' : 'YouTube'} link.</span>
                        {livePreviewData && (
                          <span className="text-slate-500">
                            (Detected:{' '}
                            {'driveKind' in livePreviewData
                              ? livePreviewData.driveKind
                              : livePreviewData.youtubeKind}
                            )
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-rose-600 text-[11px] flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{liveUrlValidation.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Class and Subject Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Class Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(Number(e.target.value) as ClassLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {CLASS_METADATA.map((c) => (
                      <option key={c.level} value={c.level}>
                        Class {c.level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value as SubjectId)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium capitalize"
                  >
                    <option value="science">Science</option>
                    <option value="mathematics">Mathematics</option>
                  </select>
                </div>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Curriculum Chapter <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {formAvailableChapters.length === 0 ? (
                    <option value="">No chapters found for this class and subject</option>
                  ) : (
                    formAvailableChapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.category})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Optional Sub-Concept Assignment */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Sub-Concept Module <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={selectedSubConceptId}
                  onChange={(e) => setSelectedSubConceptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">Entire Chapter (Applies to all sub-concepts)</option>
                  {formAvailableSubConcepts.map((sub, idx) => (
                    <option key={sub.id} value={sub.id}>
                      Step {idx + 1}: {sub.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Attach to a specific module or leave as Chapter-wide resource.
                </p>
              </div>

              {/* Description Input */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Description / Study Guidance <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide guidance to students, e.g. 'Read pages 4–9 before attempting the Ray Optics lab' or 'Timestamp 04:30 covers the transpose method'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="modalIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="modalIsActive" className="font-bold text-slate-800 cursor-pointer">
                  Visible to Students
                  <span className="block text-[11px] font-normal text-slate-500">
                    When enabled, authenticated and permitted students can access this resource on their chapter view.
                  </span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn-secondary px-4 py-2 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-5 py-2 font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{editingId ? 'Save Changes' : 'Create Resource'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Delete Learning Resource?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this resource? Students will no longer be able to access the embedded preview or link. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteResource(deletingId)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 text-xs rounded-xl transition cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Preview: {previewResource.title}
                </span>
                <span className="text-xs text-slate-500">
                  (Class {previewResource.classLevel} · {previewResource.subject})
                </span>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {previewResource.resourceType === 'youtube' && previewResource.embedUrl && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md">
                  <iframe
                    src={previewResource.embedUrl}
                    title={previewResource.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {previewResource.resourceType === 'google_drive' && previewResource.embedUrl && (
                <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                  <iframe
                    src={previewResource.embedUrl}
                    title={previewResource.title}
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {(!previewResource.embedUrl ||
                (previewResource.resourceType === 'google_drive' && !previewResource.embedUrl)) && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">
                    This resource opens directly in a new tab:
                  </p>
                  <a
                    href={previewResource.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold mt-3"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800">Resource Details:</div>
                <div className="text-slate-600">{previewResource.description || 'No description provided.'}</div>
                <div className="text-slate-500 font-mono text-[11px] truncate pt-1">
                  Target URL: {previewResource.resourceUrl}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
              <a
                href={previewResource.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <span>Launch Original Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPreviewResource(null)}
                className="btn-secondary px-4 py-1.5 font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resources Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>Configured Resources</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px]">
              {filteredResources.length} items
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Use ▲/▼ to reorder display sequence
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p>Loading learning resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Video className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-800 text-sm">No Learning Resources Found</div>
            <p className="max-w-md mx-auto text-slate-500">
              {searchQuery || filterClass !== 'all' || filterSubject !== 'all' || filterType !== 'all'
                ? 'No resources match your active filters. Try adjusting your search query or reset the filters.'
                : 'No learning resources have been added yet. Click "Add New Resource" to attach Google Drive materials or YouTube videos.'}
            </p>
            <button
              onClick={handleOpenAddForm}
              className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Resource</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredResources.map((item, index) => {
              const isDrive = item.resourceType === 'google_drive';

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors ${
                    !item.isActive ? 'opacity-65 bg-slate-50/50' : ''
                  }`}
                >
                  {/* Left: Reorder Controls + Type Icon */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ${
                          index === 0 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === filteredResources.length - 1}
                        className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ${
                          index === filteredResources.length - 1 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail or Badge */}
                    <div className="relative shrink-0">
                      {item.resourceType === 'youtube' && item.thumbnailUrl ? (
                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-900 relative shadow-xs">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-white drop-shadow-sm" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isDrive ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {isDrive ? <Folder className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </div>
                      )}
                    </div>

                    {/* Main Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] ${
                            isDrive
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isDrive ? 'Google Drive' : 'YouTube'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                          Class {item.classLevel}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold capitalize">
                          {item.subject}
                        </span>

                        <span className="text-slate-400">·</span>

                        <span className="text-slate-600 font-medium truncate max-w-xs">
                          {item.chapterTitle || item.chapterId}
                        </span>

                        {item.subConceptTitle && (
                          <span className="text-blue-600 font-medium truncate max-w-xs">
                            / {item.subConceptTitle}
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.isActive ? 'Visible' : 'Hidden'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-md pt-0.5">
                        {item.resourceUrl}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setPreviewResource(item)}
                      className="btn-secondary px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Preview embedded resource"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title={item.isActive ? 'Hide from students' : 'Make visible to students'}
                    >
                      {item.isActive ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditForm(item)}
                      className="btn-secondary px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Edit resource"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
