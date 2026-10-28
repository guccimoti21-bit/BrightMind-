import React, { useState, useEffect, useRef } from 'react';
import {
  ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  FileImage,
  Database
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { isSupabaseLiveConfigured } from '../../../lib/supabase';
import {
  HomepageImage,
  HomepageImagesConfig,
  fetchHomepageImages,
  saveHomepageImage,
  removeHomepageImage,
  validateImageFile,
  HOMEPAGE_IMAGES_UPDATED_EVENT,
  MAX_IMAGE_SIZE_BYTES
} from '../../../services/homepageImageService';

export function AdminHomepageImagesView() {
  const { token, admin } = useAdminAuth();
  const isLiveSupabase = isSupabaseLiveConfigured();

  const [imagesConfig, setImagesConfig] = useState<HomepageImagesConfig>({
    image1: null,
    image2: null
  });
  const [loading, setLoading] = useState(true);

  // Per-slot pending files & metadata
  const [slot1File, setSlot1File] = useState<File | null>(null);
  const [slot1Preview, setSlot1Preview] = useState<string | null>(null);
  const [slot1Title, setSlot1Title] = useState<string>('');
  const [slot1Alt, setSlot1Alt] = useState<string>('');
  const [slot1Saving, setSlot1Saving] = useState(false);
  const [slot1Error, setSlot1Error] = useState<string | null>(null);

  const [slot2File, setSlot2File] = useState<File | null>(null);
  const [slot2Preview, setSlot2Preview] = useState<string | null>(null);
  const [slot2Title, setSlot2Title] = useState<string>('');
  const [slot2Alt, setSlot2Alt] = useState<string>('');
  const [slot2Saving, setSlot2Saving] = useState(false);
  const [slot2Error, setSlot2Error] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      const config = await fetchHomepageImages();
      setImagesConfig(config);

      // Seed title/alt if existing
      if (config.image1) {
        setSlot1Title(config.image1.title || '');
        setSlot1Alt(config.image1.altText || '');
      }
      if (config.image2) {
        setSlot2Title(config.image2.title || '');
        setSlot2Alt(config.image2.altText || '');
      }
    } catch (e: any) {
      console.warn('Error loading homepage images:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setImagesConfig(e.detail);
      }
    };

    window.addEventListener(HOMEPAGE_IMAGES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(HOMEPAGE_IMAGES_UPDATED_EVENT, handleUpdate);
  }, []);

  // Handle File Selection
  const handleSelectFile = (slot: 'image1' | 'image2', file: File | null) => {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      if (slot === 'image1') setSlot1Error(validation.error || 'Invalid file');
      else setSlot2Error(validation.error || 'Invalid file');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (slot === 'image1') {
      setSlot1Error(null);
      setSlot1File(file);
      setSlot1Preview(objectUrl);
      if (!slot1Alt) {
        setSlot1Alt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } else {
      setSlot2Error(null);
      setSlot2File(file);
      setSlot2Preview(objectUrl);
      if (!slot2Alt) {
        setSlot2Alt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  // Save/Upload action
  const handleSaveSlot = async (slot: 'image1' | 'image2') => {
    const file = slot === 'image1' ? slot1File : slot2File;
    const title = slot === 'image1' ? slot1Title : slot2Title;
    const altText = slot === 'image1' ? slot1Alt : slot2Alt;
    const existing = imagesConfig[slot];

    if (!file && !existing) {
      if (slot === 'image1') setSlot1Error('Please choose an image file before saving.');
      else setSlot2Error('Please choose an image file before saving.');
      return;
    }

    try {
      if (slot === 'image1') {
        setSlot1Saving(true);
        setSlot1Error(null);
      } else {
        setSlot2Saving(true);
        setSlot2Error(null);
      }

      if (file) {
        const saved = await saveHomepageImage(
          slot,
          file,
          { title, altText },
          token || undefined
        );
        showNotification('success', `Homepage Image ${slot === 'image1' ? '1' : '2'} uploaded and saved successfully!`);

        if (slot === 'image1') {
          setSlot1File(null);
          setSlot1Preview(null);
        } else {
          setSlot2File(null);
          setSlot2Preview(null);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to save image.';
      if (slot === 'image1') setSlot1Error(msg);
      else setSlot2Error(msg);
      showNotification('error', msg);
    } finally {
      if (slot === 'image1') setSlot1Saving(false);
      else setSlot2Saving(false);
    }
  };

  // Remove action
  const handleRemoveSlot = async (slot: 'image1' | 'image2') => {
    const slotLabel = slot === 'image1' ? 'Image 1' : 'Image 2';
    if (!window.confirm(`Are you sure you want to permanently remove Homepage ${slotLabel}? It will no longer appear on the public homepage.`)) {
      return;
    }

    try {
      if (slot === 'image1') setSlot1Saving(true);
      else setSlot2Saving(true);

      await removeHomepageImage(slot, token || undefined);

      if (slot === 'image1') {
        setSlot1File(null);
        setSlot1Preview(null);
        setSlot1Title('');
        setSlot1Alt('');
        setSlot1Error(null);
      } else {
        setSlot2File(null);
        setSlot2Preview(null);
        setSlot2Title('');
        setSlot2Alt('');
        setSlot2Error(null);
      }

      showNotification('success', `Homepage ${slotLabel} removed successfully.`);
    } catch (err: any) {
      showNotification('error', err.message || `Failed to remove ${slotLabel}.`);
    } finally {
      if (slot === 'image1') setSlot1Saving(false);
      else setSlot2Saving(false);
    }
  };

  // Helper to render an individual image slot card
  const renderSlotCard = (
    slot: 'image1' | 'image2',
    label: string,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    pendingFile: File | null,
    pendingPreview: string | null,
    title: string,
    setTitle: (val: string) => void,
    alt: string,
    setAlt: (val: string) => void,
    saving: boolean,
    error: string | null,
    clearPending: () => void
  ) => {
    const existing = imagesConfig[slot];
    const displayImage = pendingPreview || existing?.imageUrl;
    const hasExisting = Boolean(existing);
    const hasPending = Boolean(pendingFile);

    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center font-bold text-xs">
                {slot === 'image1' ? '01' : '02'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">{label}</h3>
                <p className="text-[11px] text-[#64748B]">
                  {hasExisting ? 'Active on Public Homepage' : 'Slot Empty (Hidden from Homepage)'}
                </p>
              </div>
            </div>

            {hasExisting ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                Empty
              </span>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              handleSelectFile(slot, file);
              e.target.value = '';
            }}
          />

          {/* Image Preview / Upload Box */}
          {displayImage ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-50 aspect-video flex items-center justify-center group shadow-inner">
                <img
                  src={displayImage}
                  alt={alt || label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-2xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-[#111827] rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Replace Image</span>
                  </button>
                  <a
                    href={displayImage}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white/90 text-[#111827] rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-white cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full</span>
                  </a>
                </div>
              </div>

              {/* Image metadata tag */}
              <div className="flex items-center justify-between text-[11px] text-[#64748B] px-1">
                <span>
                  {pendingFile ? `Selected: ${pendingFile.name} (${(pendingFile.size / 1024).toFixed(0)} KB)` : existing?.fileName || 'Uploaded Image'}
                </span>
                {existing?.updatedAt && !pendingFile && (
                  <span>Saved: {new Date(existing.updatedAt).toLocaleDateString()}</span>
                )}
                {pendingFile && (
                  <span className="text-amber-600 font-semibold">Unsaved preview</span>
                )}
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#F8FAFF] rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#111827]">
                  Click to browse and upload {label}
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Supports JPG, PNG, WebP, SVG, or GIF (up to 5 MB)
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields for Title & Alt Text */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1">
                Image Title / Headline (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Science Laboratory Highlights or Math Sandbox"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1">
                Accessibility Alt Description
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Brief description for screen readers"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 mt-4 border-t border-[#EDF2F7] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {displayImage && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Replace</span>
              </button>
            )}

            {hasPending && (
              <button
                type="button"
                onClick={clearPending}
                disabled={saving}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {hasExisting && (
              <button
                type="button"
                onClick={() => handleRemoveSlot(slot)}
                disabled={saving}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Remove</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSaveSlot(slot)}
              disabled={saving || (!hasPending && !hasExisting)}
              className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{hasPending ? 'Save Upload' : 'Update Details'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-[#111827]">Homepage Images</h2>
          </div>
          <p className="text-xs text-[#475569]">
            Upload and manage exactly two featured images displayed side-by-side on the public SciMathenova homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Storage Mode Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Database className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-slate-600 font-medium">Storage:</span>
            <span className="font-semibold text-[#111827]">
              {isLiveSupabase ? 'Supabase Persistent Storage' : 'Local Persistence & Server'}
            </span>
          </div>

          <button
            onClick={loadImages}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Images"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Guidelines Card */}
      <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#111827] block">Homepage Placement &amp; Visibility</span>
          <p className="text-[#3B82F6] leading-relaxed">
            Images uploaded here will appear in a responsive container directly below the homepage Hero section and above the Chapter Index.
            If only one image is saved, only that image will be displayed. If no image has been uploaded, the homepage slot remains completely hidden with zero placeholder graphics.
          </p>
        </div>
      </div>

      {/* Two Image Upload Slots (Side-by-Side Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSlotCard(
          'image1',
          'Homepage Image 1',
          fileInputRef1,
          slot1File,
          slot1Preview,
          slot1Title,
          setSlot1Title,
          slot1Alt,
          setSlot1Alt,
          slot1Saving,
          slot1Error,
          () => {
            setSlot1File(null);
            setSlot1Preview(null);
            setSlot1Error(null);
          }
        )}

        {renderSlotCard(
          'image2',
          'Homepage Image 2',
          fileInputRef2,
          slot2File,
          slot2Preview,
          slot2Title,
          setSlot2Title,
          slot2Alt,
          setSlot2Alt,
          slot2Saving,
          slot2Error,
          () => {
            setSlot2File(null);
            setSlot2Preview(null);
            setSlot2Error(null);
          }
        )}
      </div>
    </div>
  );
}
