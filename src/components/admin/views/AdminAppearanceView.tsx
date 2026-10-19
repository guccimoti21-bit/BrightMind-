import React, { useState, useEffect } from 'react';
import { Palette, Save, CheckCircle2, Eye, Monitor, Smartphone, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AppearanceConfig } from '../../../../server/db';

export function AdminAppearanceView() {
  const { token } = useAdminAuth();
  const [appearance, setAppearance] = useState<AppearanceConfig>({
    siteTitle: 'BrightMind Learning',
    tagline: 'Interactive Science & Mathematics Learning Platform for Classes 6 to 10',
    heroHeadline: 'Discover Science. Master Mathematics.',
    heroSubheadline: 'Explore concepts, experiment with ideas, solve real-world problems, and learn at your own pace with interactive lessons designed for Classes 6–10.',
    heroBadge: 'Interactive EdTech Platform for Classes 6–10',
    announcementBanner: {
      enabled: true,
      text: 'New: Interactive Physics & Algebra Laboratory modules for Classes 6–10 are now active.',
      linkText: 'Explore Featured Demo'
    },
    footerNotice: '© 2026 BrightMind Learning. Built with NCERT & CBSE pedagogical rigor.',
    supportEmail: 'support@brightmind.learning'
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/appearance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppearance(data);
        }
      } catch (e) {
        console.error('Error fetching appearance:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/appearance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(appearance)
      });
      if (res.ok) {
        setSaveStatus('Website appearance & homepage copy updated live!');
        setTimeout(() => setSaveStatus(''), 2500);
      }
    } catch (e) {
      console.error('Error saving appearance:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Website Appearance &amp; Copy Editor</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Modify homepage headlines, announcement banners, and brand metadata with live preview.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F1F5FF] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              previewMode === 'desktop' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              previewMode === 'mobile' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form (6 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-6 space-y-4 text-xs">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <label className="font-semibold text-[#111827] block mb-1">Hero Main Headline</label>
              <input
                type="text"
                value={appearance.heroHeadline}
                onChange={(e) => setAppearance({ ...appearance, heroHeadline: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-[#111827] font-bold text-sm focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-[#111827] block mb-1">Hero Sub-Headline / Supporting Copy</label>
              <textarea
                rows={3}
                value={appearance.heroSubheadline}
                onChange={(e) => setAppearance({ ...appearance, heroSubheadline: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-[#475569] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-[#111827] block mb-1">Hero Kicker Badge</label>
              <input
                type="text"
                value={appearance.heroBadge}
                onChange={(e) => setAppearance({ ...appearance, heroBadge: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-[#2563EB] font-medium focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
              />
            </div>

            {/* Announcement Banner */}
            <div className="pt-3 border-t border-[#EDF2F7] space-y-3">
              <label className="flex items-center gap-2 text-[#111827] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={appearance.announcementBanner.enabled}
                  onChange={(e) =>
                    setAppearance({
                      ...appearance,
                      announcementBanner: { ...appearance.announcementBanner, enabled: e.target.checked }
                    })
                  }
                  className="accent-[#2563EB] rounded cursor-pointer"
                />
                <span>Enable Top Announcement Banner</span>
              </label>

              {appearance.announcementBanner.enabled && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={appearance.announcementBanner.text}
                    onChange={(e) =>
                      setAppearance({
                        ...appearance,
                        announcementBanner: { ...appearance.announcementBanner, text: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-[#111827] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
                    placeholder="Announcement text..."
                  />
                  <input
                    type="text"
                    value={appearance.announcementBanner.linkText || ''}
                    onChange={(e) =>
                      setAppearance({
                        ...appearance,
                        announcementBanner: { ...appearance.announcementBanner, linkText: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-[#2563EB] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
                    placeholder="Action link label..."
                  />
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="pt-3 border-t border-[#EDF2F7]">
              <label className="font-semibold text-[#111827] block mb-1">Footer Copyright Notice</label>
              <input
                type="text"
                value={appearance.footerNotice}
                onChange={(e) => setAppearance({ ...appearance, footerNotice: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-[#64748B] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
              />
            </div>

            <div className="pt-3 border-t border-[#EDF2F7] flex justify-end">
              <button
                type="submit"
                className="btn-primary px-6 py-2.5 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Appearance Changes</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview Screen (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>Live {previewMode === 'desktop' ? 'Desktop (1440px)' : 'Mobile Phone'} Viewport</span>
          </span>

          <div
            className={`mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-xl p-6 transition-all ${
              previewMode === 'mobile' ? 'max-w-[340px]' : 'w-full'
            }`}
          >
            {/* Announcement banner preview */}
            {appearance.announcementBanner.enabled && (
              <div className="mb-4 p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] text-[#2563EB] text-center">
                <span>{appearance.announcementBanner.text} </span>
                {appearance.announcementBanner.linkText && (
                  <strong className="underline ml-1 cursor-pointer">{appearance.announcementBanner.linkText}</strong>
                )}
              </div>
            )}

            {/* Hero preview */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>{appearance.heroBadge}</span>
              </div>

              <h1 className="text-2xl font-black text-[#111827] leading-tight">
                {appearance.heroHeadline}
              </h1>

              <p className="text-xs text-[#475569] leading-relaxed">
                {appearance.heroSubheadline}
              </p>

              <div className="flex gap-2 pt-2">
                <div className="px-4 py-2 bg-[#2563EB] rounded-lg text-white font-bold text-[11px] text-center shadow-xs">
                  Start Learning
                </div>
                <div className="px-3 py-2 bg-[#F1F5FF] border border-[#E2E8F0] rounded-lg text-[#475569] text-[11px] text-center font-medium">
                  Explore Courses
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#EDF2F7] text-[10px] text-[#64748B] text-center">
              {appearance.footerNotice}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
