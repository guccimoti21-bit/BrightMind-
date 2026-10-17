import React, { useEffect, useState } from 'react';
import { Layers, Edit3, Check, X, Plus, BookOpen, AlertCircle, Save } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { CLASS_METADATA } from '../../../data/curriculumData';

export function AdminClassesView() {
  const { token } = useAdminAuth();
  const [classesList, setClassesList] = useState<typeof CLASS_METADATA>(CLASS_METADATA);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClassesList(data);
        }
      } catch (e) {
        console.error('Error fetching classes:', e);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, [token]);

  const handleStartEdit = (item: any) => {
    setEditingLevel(item.level);
    setEditForm({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!token || editingLevel === null) return;
    try {
      const res = await fetch(`/api/admin/classes/${editingLevel}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setClassesList((prev) =>
          prev.map((c) => (c.level === editingLevel ? updated : c))
        );
        setEditingLevel(null);
        setSaveStatus('Class metadata saved successfully.');
        setTimeout(() => setSaveStatus(''), 2500);
      }
    } catch (e) {
      console.error('Error saving class:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Manage Classes (6–10)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure grades, curriculum descriptions, and syllabi counts.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classesList.map((c) => {
          const isEditing = editingLevel === c.level;

          return (
            <div
              key={c.level}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Class Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Description &amp; Focus
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Subjects Count
                      </label>
                      <input
                        type="number"
                        value={editForm.subjectsCount}
                        onChange={(e) => setEditForm({ ...editForm, subjectsCount: parseInt(e.target.value, 10) || 2 })}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Chapters Count
                      </label>
                      <input
                        type="number"
                        value={editForm.chaptersCount}
                        onChange={(e) => setEditForm({ ...editForm, chaptersCount: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingLevel(null)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold font-mono text-cyan-400">
                        Class 0{c.level}
                      </span>
                      <span className="text-xs bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                        Active Grade
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                        <span className="text-slate-400 block text-[10px]">Subjects</span>
                        <span className="text-white font-bold">{c.subjectsCount} (Sci + Math)</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                        <span className="text-slate-400 block text-[10px]">Syllabus Units</span>
                        <span className="text-white font-bold">{c.chaptersCount} Modules</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit Class</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
