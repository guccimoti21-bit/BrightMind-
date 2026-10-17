import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, Eye, Search } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { MediaItem } from '../../../../server/db';

export function AdminMediaView() {
  const { token } = useAdminAuth();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadMedia = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [token]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Maximum file upload size is 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            originalName: file.name,
            dataUrl,
            mimeType: file.type,
            altText: file.name.replace(/\.[^/.]+$/, '')
          })
        });

        if (res.ok) {
          const item = await res.json();
          setMediaList((prev) => [item, ...prev]);
        } else {
          setUploadError('Upload failed on server.');
        }
      } catch (err: any) {
        setUploadError(err.message || 'Upload error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Delete media asset "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (e) {
      console.error('Error deleting media:', e);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter((m) =>
    m.originalName.toLowerCase().includes(search.toLowerCase()) ||
    m.altText.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Media &amp; Illustration Library</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload, preview, organize, and copy educational graphics and diagram assets.
          </p>
        </div>

        <div>
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload Image / Diagram'}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl">
          {uploadError}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search media files by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group"
          >
            <div className="h-40 bg-slate-950 relative overflow-hidden flex items-center justify-center p-2">
              {item.mimeType.startsWith('image/') ? (
                <img
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-slate-600" />
              )}
            </div>

            <div className="p-3.5 space-y-2">
              <div className="font-bold text-white text-xs truncate" title={item.originalName}>
                {item.originalName}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{Math.round(item.sizeBytes / 1024)} KB</span>
                <span>{item.mimeType.split('/')[1]?.toUpperCase()}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(item.id, item.url)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.originalName)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Delete Media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
