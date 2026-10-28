import React, { useState, useEffect } from 'react';
import {
  Video,
  Folder,
  ExternalLink,
  Play,
  FileText,
  Presentation,
  FileSpreadsheet,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import { LearningResource } from '../../types/curriculum';
import {
  fetchLearningResources,
  getCachedLearningResources,
  getResourcesForChapter,
  LEARNING_RESOURCES_UPDATED_EVENT
} from '../../services/learningResourceService';

interface LearningResourcesSectionProps {
  chapterId: string;
  subConceptId?: string;
  chapterTitle?: string;
  subConceptTitle?: string;
}

export function LearningResourcesSection({
  chapterId,
  subConceptId,
  chapterTitle,
  subConceptTitle
}: LearningResourcesSectionProps) {
  const [resources, setResources] = useState<LearningResource[]>(() => {
    return getResourcesForChapter(getCachedLearningResources(), chapterId, subConceptId);
  });

  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'google_drive' | 'youtube'>('all');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchLearningResources({
          chapterId,
          subConceptId,
          includeInactive: false
        });
        if (isMounted) {
          setResources(data.filter((r) => r.isActive));
        }
      } catch (err) {
        console.warn('Failed to load learning resources for chapter:', err);
      }
    };

    loadData();

    const handleUpdate = () => {
      const all = getCachedLearningResources();
      setResources(getResourcesForChapter(all, chapterId, subConceptId));
    };

    window.addEventListener(LEARNING_RESOURCES_UPDATED_EVENT, handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(LEARNING_RESOURCES_UPDATED_EVENT, handleUpdate);
    };
  }, [chapterId, subConceptId]);

  // If no resources are configured by the admin, DO NOT render placeholders or sample slop
  if (!resources || resources.length === 0) {
    return null;
  }

  const driveCount = resources.filter((r) => r.resourceType === 'google_drive').length;
  const ytCount = resources.filter((r) => r.resourceType === 'youtube').length;

  const displayedResources = resources.filter((r) => {
    if (filterType === 'google_drive') return r.resourceType === 'google_drive';
    if (filterType === 'youtube') return r.resourceType === 'youtube';
    return true;
  });

  return (
    <div className="space-y-4 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="text-xs text-[#2563EB] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Learning Resources</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            Chapter Materials &amp; Video Tutorials
          </h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Teacher-verified notes, presentations, and video lessons for{' '}
            <span className="font-semibold text-slate-800">{chapterTitle || 'this chapter'}</span>.
          </p>
        </div>

        {/* Filter Pills */}
        {(driveCount > 0 && ytCount > 0) && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs shrink-0 self-start sm:self-end">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({resources.length})
            </button>
            <button
              onClick={() => setFilterType('google_drive')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'google_drive'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drive Notes ({driveCount})
            </button>
            <button
              onClick={() => setFilterType('youtube')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'youtube'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Videos ({ytCount})
            </button>
          </div>
        )}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedResources.map((item) => {
          const isDrive = item.resourceType === 'google_drive';
          const isExpanded = activeEmbedId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                isExpanded
                  ? 'border-blue-400 ring-2 ring-blue-100 md:col-span-2 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Card Top Banner / Media */}
              {item.resourceType === 'youtube' && !isExpanded && (
                <div
                  className="relative aspect-video w-full bg-slate-900 cursor-pointer group overflow-hidden"
                  onClick={() => setActiveEmbedId(item.id)}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                      <Video className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.youtubeKind === 'playlist'
                      ? 'Playlist'
                      : item.youtubeKind === 'shorts'
                      ? 'Shorts'
                      : 'Video'}
                  </div>
                </div>
              )}

              {/* Inline Embedded Player (When Expanded) */}
              {isExpanded && (
                <div className="w-full bg-slate-900 relative">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 text-white text-xs">
                    <span className="font-semibold truncate pr-4">
                      {item.title}
                    </span>
                    <button
                      onClick={() => setActiveEmbedId(null)}
                      className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                      title="Close player"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {item.resourceType === 'youtube' && item.embedUrl && (
                    <div className="relative aspect-video w-full">
                      <iframe
                        src={item.embedUrl}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}

                  {item.resourceType === 'google_drive' && item.embedUrl && (
                    <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-white">
                      <iframe
                        src={item.embedUrl}
                        title={item.title}
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}

                  {/* Fallback Notice */}
                  {!item.embedUrl && (
                    <div className="p-8 text-center text-slate-300 text-xs space-y-2">
                      <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                      <p>This resource does not support embedded iframe viewing.</p>
                      <a
                        href={item.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 mt-2 font-bold"
                      >
                        <span>Open in New Tab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 ${
                        isDrive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isDrive ? <Folder className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                      <span>{isDrive ? 'Google Drive' : 'YouTube Tutorial'}</span>
                    </span>

                    {item.subConceptTitle && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium truncate max-w-[200px]">
                        Module: {item.subConceptTitle}
                      </span>
                    )}

                    {isDrive && item.driveKind && (
                      <span className="text-slate-500 font-medium capitalize">
                        · {item.driveKind}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  {/* Embedded Preview Trigger */}
                  {item.embedUrl ? (
                    <button
                      onClick={() => setActiveEmbedId(isExpanded ? null : item.id)}
                      className={`font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isExpanded
                          ? 'bg-slate-100 text-slate-800'
                          : isDrive
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Close Preview</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isDrive ? 'Preview Document' : 'Watch Video'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Direct Link</span>
                  )}

                  {/* Open in New Tab Button */}
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary px-3.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors"
                    title="Open original resource in a new tab"
                  >
                    <span>{isDrive ? 'Open Resource' : 'Watch on YouTube'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
