import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  HelpCircle,
  Lightbulb,
  Scale,
  Sun,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { SubConcept, Concept } from '../../../types/curriculum';

interface AdminLessonEditorViewProps {
  initialConceptId?: string;
  initialSubConceptId?: string;
  onBackToConcepts: () => void;
}

export function AdminLessonEditorView({
  initialConceptId,
  initialSubConceptId,
  onBackToConcepts
}: AdminLessonEditorViewProps) {
  const { token } = useAdminAuth();
  const [concepts, setConcepts] = useState<any[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string>(initialConceptId || 'c8-math-linear-eq');
  const [selectedSubId, setSelectedSubId] = useState<string>(initialSubConceptId || 'c8-math-linear-sub2');
  const [subConceptData, setSubConceptData] = useState<SubConcept | null>(null);
  const [activeTab, setActiveTab] = useState<'objectives' | 'explanation' | 'activity' | 'examples' | 'practice' | 'revision' | 'preview'>('explanation');
  const [saveStatus, setSaveStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load all concepts
  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/concepts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConcepts(data);
          const c = data.find((item: any) => item.id === selectedConceptId) || data[0];
          if (c) {
            setSelectedConceptId(c.id);
            const sub = c.subConcepts.find((s: any) => s.id === selectedSubId) || c.subConcepts[0];
            if (sub) {
              setSelectedSubId(sub.id);
              setSubConceptData(JSON.parse(JSON.stringify(sub)));
            }
          }
        }
      } catch (e) {
        console.error('Error loading concepts for editor:', e);
      }
    }
    load();
  }, [token]);

  // When chapter selection changes
  const handleConceptChange = (conceptId: string) => {
    setSelectedConceptId(conceptId);
    const c = concepts.find((item) => item.id === conceptId);
    if (c && c.subConcepts.length > 0) {
      setSelectedSubId(c.subConcepts[0].id);
      setSubConceptData(JSON.parse(JSON.stringify(c.subConcepts[0])));
    } else {
      setSelectedSubId('');
      setSubConceptData(null);
    }
  };

  // When sub-concept selection changes
  const handleSubConceptChange = (subId: string) => {
    setSelectedSubId(subId);
    const c = concepts.find((item) => item.id === selectedConceptId);
    if (c) {
      const sub = c.subConcepts.find((s: any) => s.id === subId);
      if (sub) {
        setSubConceptData(JSON.parse(JSON.stringify(sub)));
      }
    }
  };

  const handleSaveLesson = async (publish: boolean = false) => {
    if (!token || !selectedConceptId || !selectedSubId || !subConceptData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/concepts/${selectedConceptId}/subconcepts/${selectedSubId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subConceptData)
      });
      if (res.ok) {
        setSaveStatus(publish ? 'Lesson published live to student portal!' : 'Lesson draft saved.');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (e) {
      console.error('Error saving lesson:', e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!subConceptData) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading lesson content editor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToConcepts}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Back to Chapters"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Lesson Content Management
            </span>
            <h2 className="text-lg font-bold text-white">
              {subConceptData.title}
            </h2>
          </div>
        </div>

        {/* Chapter & Sub-concept Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <select
            value={selectedConceptId}
            onChange={(e) => handleConceptChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 max-w-[200px] truncate"
          >
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                Cl.{c.classLevel} - {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedSubId}
            onChange={(e) => handleSubConceptChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 max-w-[220px] truncate"
          >
            {concepts
              .find((c) => c.id === selectedConceptId)
              ?.subConcepts?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  Step {s.order}: {s.title}
                </option>
              ))}
          </select>

          <button
            onClick={() => handleSaveLesson(false)}
            disabled={isSaving}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-300" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSaveLesson(true)}
            disabled={isSaving}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Editor Section Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'objectives', label: '1. Objectives' },
          { key: 'explanation', label: '2. Concept Explanation' },
          { key: 'activity', label: '3. Interactive Activity' },
          { key: 'examples', label: '4. Worked Examples' },
          { key: 'practice', label: '5. Guided Practice' },
          { key: 'revision', label: '6. Quick Revision' },
          { key: 'preview', label: '7. Student Preview' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* TAB 1: OBJECTIVES */}
        {activeTab === 'objectives' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Learning Objectives (2-3 items)
              </h3>
              <button
                onClick={() => {
                  setSubConceptData({
                    ...subConceptData,
                    learningObjectives: [...subConceptData.learningObjectives, '']
                  });
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Objective
              </button>
            </div>

            <div className="space-y-3">
              {subConceptData.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-950 text-cyan-400 border border-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => {
                      const updated = [...subConceptData.learningObjectives];
                      updated[i] = e.target.value;
                      setSubConceptData({ ...subConceptData, learningObjectives: updated });
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      const updated = subConceptData.learningObjectives.filter((_, idx) => idx !== i);
                      setSubConceptData({ ...subConceptData, learningObjectives: updated });
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EXPLANATION */}
        {activeTab === 'explanation' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Concept Introduction (Simple, age-appropriate prose)
              </label>
              <textarea
                rows={4}
                value={subConceptData.explanation.introduction}
                onChange={(e) =>
                  setSubConceptData({
                    ...subConceptData,
                    explanation: { ...subConceptData.explanation, introduction: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            {/* Definitions */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Key Definitions &amp; Formulas
                </span>
                <button
                  onClick={() => {
                    setSubConceptData({
                      ...subConceptData,
                      explanation: {
                        ...subConceptData.explanation,
                        keyDefinitions: [
                          ...subConceptData.explanation.keyDefinitions,
                          { term: '', definition: '', formula: '' }
                        ]
                      }
                    });
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Definition
                </button>
              </div>

              {subConceptData.explanation.keyDefinitions.map((def, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Term (e.g. Variable)"
                      value={def.term}
                      onChange={(e) => {
                        const copy = [...subConceptData.explanation.keyDefinitions];
                        copy[idx].term = e.target.value;
                        setSubConceptData({
                          ...subConceptData,
                          explanation: { ...subConceptData.explanation, keyDefinitions: copy }
                        });
                      }}
                      className="w-1/3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Formula (optional, e.g. ax + b = c)"
                      value={def.formula || ''}
                      onChange={(e) => {
                        const copy = [...subConceptData.explanation.keyDefinitions];
                        copy[idx].formula = e.target.value;
                        setSubConceptData({
                          ...subConceptData,
                          explanation: { ...subConceptData.explanation, keyDefinitions: copy }
                        });
                      }}
                      className="w-2/3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-cyan-300 font-mono"
                    />
                    <button
                      onClick={() => {
                        const copy = subConceptData.explanation.keyDefinitions.filter((_, i) => i !== idx);
                        setSubConceptData({
                          ...subConceptData,
                          explanation: { ...subConceptData.explanation, keyDefinitions: copy }
                        });
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Clear definition..."
                    value={def.definition}
                    onChange={(e) => {
                      const copy = [...subConceptData.explanation.keyDefinitions];
                      copy[idx].definition = e.target.value;
                      setSubConceptData({
                        ...subConceptData,
                        explanation: { ...subConceptData.explanation, keyDefinitions: copy }
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                  />
                </div>
              ))}
            </div>

            {/* Key Takeaway */}
            <div className="pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Core Takeaway Quote
              </label>
              <input
                type="text"
                value={subConceptData.explanation.keyTakeaway}
                onChange={(e) =>
                  setSubConceptData({
                    ...subConceptData,
                    explanation: { ...subConceptData.explanation, keyTakeaway: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-300 font-medium"
              />
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive Activity Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Activity Type
                </label>
                <select
                  value={subConceptData.activity.type}
                  onChange={(e) =>
                    setSubConceptData({
                      ...subConceptData,
                      activity: { ...subConceptData.activity, type: e.target.value as any }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="balance-scale">Virtual Balance Scale (Algebra)</option>
                  <option value="ray-optics">Ray Optics Reflection Lab (Physics)</option>
                  <option value="number-line">Number Line &amp; Rational Numbers</option>
                  <option value="fraction-strip">Fraction Strips Visualizer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  value={subConceptData.activity.title}
                  onChange={(e) =>
                    setSubConceptData({
                      ...subConceptData,
                      activity: { ...subConceptData.activity, title: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Student Instructions
              </label>
              <textarea
                rows={3}
                value={subConceptData.activity.instructions}
                onChange={(e) =>
                  setSubConceptData({
                    ...subConceptData,
                    activity: { ...subConceptData.activity, instructions: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Activity Goal / Victory Condition
              </label>
              <input
                type="text"
                value={subConceptData.activity.goal}
                onChange={(e) =>
                  setSubConceptData({
                    ...subConceptData,
                    activity: { ...subConceptData.activity, goal: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-300"
              />
            </div>
          </div>
        )}

        {/* TAB 4: WORKED EXAMPLES */}
        {activeTab === 'examples' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Step-by-Step Solved Examples
              </h3>
              <button
                onClick={() => {
                  setSubConceptData({
                    ...subConceptData,
                    workedExamples: [
                      ...subConceptData.workedExamples,
                      {
                        id: `we-${Date.now()}`,
                        problem: 'New math/science problem...',
                        steps: [
                          { stepNumber: 1, title: 'First step', math: 'LHS = RHS', explanation: 'Reasoning...' }
                        ],
                        realWorldApplication: 'Real-world context...'
                      }
                    ]
                  });
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Solved Example
              </button>
            </div>

            {subConceptData.workedExamples.map((ex, exIdx) => (
              <div key={ex.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">Example {exIdx + 1}</span>
                  <button
                    onClick={() => {
                      const updated = subConceptData.workedExamples.filter((_, i) => i !== exIdx);
                      setSubConceptData({ ...subConceptData, workedExamples: updated });
                    }}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Problem statement..."
                  value={ex.problem}
                  onChange={(e) => {
                    const copy = [...subConceptData.workedExamples];
                    copy[exIdx].problem = e.target.value;
                    setSubConceptData({ ...subConceptData, workedExamples: copy });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-bold"
                />

                <input
                  type="text"
                  placeholder="Real-world context (optional)..."
                  value={ex.realWorldApplication || ''}
                  onChange={(e) => {
                    const copy = [...subConceptData.workedExamples];
                    copy[exIdx].realWorldApplication = e.target.value;
                    setSubConceptData({ ...subConceptData, workedExamples: copy });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 italic"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: GUIDED PRACTICE */}
        {activeTab === 'practice' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Guided Practice Warmup
            </h3>
            {subConceptData.guidedPractice.map((gp, i) => (
              <div key={gp.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400">Warmup {i + 1}</span>
                <input
                  type="text"
                  value={gp.question}
                  onChange={(e) => {
                    const copy = [...subConceptData.guidedPractice];
                    copy[i].question = e.target.value;
                    setSubConceptData({ ...subConceptData, guidedPractice: copy });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Hint..."
                  value={gp.hint}
                  onChange={(e) => {
                    const copy = [...subConceptData.guidedPractice];
                    copy[i].hint = e.target.value;
                    setSubConceptData({ ...subConceptData, guidedPractice: copy });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-300"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: REVISION */}
        {activeTab === 'revision' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Revision Flash Summary
            </h3>
            <input
              type="text"
              value={subConceptData.revisionSummary.title}
              onChange={(e) =>
                setSubConceptData({
                  ...subConceptData,
                  revisionSummary: { ...subConceptData.revisionSummary, title: e.target.value }
                })
              }
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-bold"
            />
            {subConceptData.revisionSummary.points.map((pt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={pt}
                  onChange={(e) => {
                    const copy = [...subConceptData.revisionSummary.points];
                    copy[i] = e.target.value;
                    setSubConceptData({
                      ...subConceptData,
                      revisionSummary: { ...subConceptData.revisionSummary, points: copy }
                    })
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: LIVE STUDENT PREVIEW */}
        {activeTab === 'preview' && (
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Live Student View Preview
              </span>
              <span className="text-[11px] text-slate-400">
                {subConceptData.estimatedMinutes} mins · Part {subConceptData.order}
              </span>
            </div>

            <h1 className="text-xl font-extrabold text-white">{subConceptData.title}</h1>
            <p className="text-xs text-slate-300">{subConceptData.shortDescription}</p>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">Concept Overview:</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {subConceptData.explanation.introduction}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
