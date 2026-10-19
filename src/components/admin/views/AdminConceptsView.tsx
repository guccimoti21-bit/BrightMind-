import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Clock,
  Trash2,
  Edit3,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { Concept, ClassLevel, SubjectId } from '../../../types/curriculum';

interface AdminConceptsViewProps {
  onEditLesson: (conceptId: string, subConceptId?: string) => void;
}

export function AdminConceptsView({ onEditLesson }: AdminConceptsViewProps) {
  const { token } = useAdminAuth();
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<number | 'all'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConceptForm, setNewConceptForm] = useState({
    title: '',
    description: '',
    classLevel: 8,
    subjectId: 'mathematics',
    category: 'Algebra',
    estimatedHours: 5,
    status: 'published'
  });

  const loadConcepts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/concepts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConcepts(data);
      }
    } catch (e) {
      console.error('Error fetching concepts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConcepts();
  }, [token]);

  const handleToggleStatus = async (conceptId: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/concepts/${conceptId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setConcepts((prev) =>
          prev.map((c) => (c.id === conceptId ? { ...c, status: updated.status } : c))
        );
      }
    } catch (e) {
      console.error('Error updating concept status:', e);
    }
  };

  const handleDelete = async (conceptId: string, title: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete chapter "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/concepts/${conceptId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConcepts((prev) => prev.filter((c) => c.id !== conceptId));
      }
    } catch (e) {
      console.error('Error deleting concept:', e);
    }
  };

  const handleCreateConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newConceptForm,
          subConcepts: []
        })
      });
      if (res.ok) {
        const created = await res.json();
        setConcepts((prev) => [...prev, created]);
        setShowCreateModal(false);
        setNewConceptForm({
          title: '',
          description: '',
          classLevel: 8,
          subjectId: 'mathematics',
          category: 'Algebra',
          estimatedHours: 5,
          status: 'published'
        });
      }
    } catch (e) {
      console.error('Error creating concept:', e);
    }
  };

  const filtered = concepts.filter((c) => {
    if (filterClass !== 'all' && c.classLevel !== filterClass) return false;
    if (filterSubject !== 'all' && c.subjectId !== filterSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Manage Chapters &amp; Concepts</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Organize educational units, publish status, and sub-concept learning paths.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Chapter</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search chapters by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-[#FFFFFF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="bg-[#F8FAFF] border border-[#E2E8F0] text-[#475569] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2563EB] focus:bg-[#FFFFFF]"
          >
            <option value="all">All Classes</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-[#F8FAFF] border border-[#E2E8F0] text-[#475569] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2563EB] focus:bg-[#FFFFFF]"
          >
            <option value="all">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
          </select>
        </div>
      </div>

      {/* Chapters Table / List */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFF] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Chapter Title</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Sub-concepts</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {filtered.map((concept) => (
                <tr key={concept.id} className="hover:bg-[#F8FAFF] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#111827] text-sm">{concept.title}</div>
                    <div className="text-[11px] text-[#64748B] line-clamp-1 max-w-sm mt-0.5">
                      {concept.description}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                    Class {concept.classLevel}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-[#475569] font-medium">
                    {concept.subjectId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#F1F5FF] px-2 py-0.5 rounded border border-[#E2E8F0] text-[#2563EB] font-mono text-[11px]">
                      {concept.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#475569]">
                    {concept.subConcepts?.length || 0} modules
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(concept.id, concept.status || 'published')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        concept.status === 'published'
                          ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534] hover:bg-[#DCFCE7]'
                          : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]'
                      }`}
                    >
                      {concept.status === 'published' ? '● Published' : '○ Draft Mode'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditLesson(concept.id)}
                        className="px-2.5 py-1.5 bg-[#F1F5FF] hover:bg-[#EFF6FF] text-[#2563EB] border border-[#E2E8F0] hover:border-[#BFDBFE] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Edit Lessons in this chapter"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Lessons</span>
                      </button>
                      <button
                        onClick={() => handleDelete(concept.id, concept.title)}
                        className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Chapter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
              <h3 className="text-lg font-bold text-[#111827]">Create New Curriculum Chapter</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#64748B] hover:text-[#111827] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConcept} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#111827] block mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Understanding Quadrilaterals"
                  value={newConceptForm.title}
                  onChange={(e) => setNewConceptForm({ ...newConceptForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-xs text-[#111827] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111827] block mb-1">
                  Pedagogical Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide learning objectives and scope..."
                  value={newConceptForm.description}
                  onChange={(e) => setNewConceptForm({ ...newConceptForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-xs text-[#111827] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111827] block mb-1">Class</label>
                  <select
                    value={newConceptForm.classLevel}
                    onChange={(e) =>
                      setNewConceptForm({
                        ...newConceptForm,
                        classLevel: parseInt(e.target.value, 10) as ClassLevel
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-xs text-[#111827] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
                  >
                    {[6, 7, 8, 9, 10].map((l) => (
                      <option key={l} value={l}>
                        Class {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111827] block mb-1">Subject</label>
                  <select
                    value={newConceptForm.subjectId}
                    onChange={(e) =>
                      setNewConceptForm({
                        ...newConceptForm,
                        subjectId: e.target.value as SubjectId
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-xs text-[#111827] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
                  >
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111827] block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Geometry"
                    value={newConceptForm.category}
                    onChange={(e) =>
                      setNewConceptForm({ ...newConceptForm, category: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg text-xs text-[#111827] focus:border-[#2563EB] focus:bg-[#FFFFFF] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EDF2F7]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#F1F5FF] hover:bg-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-md"
                >
                  Create Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
