import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Copy,
  Edit3,
  FileSpreadsheet,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export function AdminQuestionsView() {
  const { token } = useAdminAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvStatus, setCsvStatus] = useState('');

  const [questionForm, setQuestionForm] = useState({
    question: '',
    expression: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    category: 'application',
    difficulty: 'medium',
    classLevel: 8,
    subjectId: 'mathematics',
    conceptId: 'c8-math-linear-eq',
    subConceptId: 'c8-math-linear-sub2',
    status: 'published'
  });

  const loadQuestions = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.error('Error fetching questions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Delete this question from question bank?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (e) {
      console.error('Error deleting question:', e);
    }
  };

  const handleDuplicate = async (item: any) => {
    if (!token) return;
    const duplicated = {
      ...item,
      id: undefined,
      question: `${item.question} (Copy)`
    };
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(duplicated)
      });
      if (res.ok) {
        const created = await res.json();
        setQuestions((prev) => [created, ...prev]);
      }
    } catch (e) {
      console.error('Error duplicating question:', e);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(questionForm)
      });
      if (res.ok) {
        const created = await res.json();
        setQuestions((prev) => [created, ...prev]);
        setShowAddModal(false);
        setQuestionForm({
          question: '',
          expression: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: '',
          category: 'application',
          difficulty: 'medium',
          classLevel: 8,
          subjectId: 'mathematics',
          conceptId: 'c8-math-linear-eq',
          subConceptId: 'c8-math-linear-sub2',
          status: 'published'
        });
      }
    } catch (e) {
      console.error('Error saving question:', e);
    }
  };

  const handleImportCsv = async () => {
    if (!token || !csvText.trim()) return;
    try {
      const res = await fetch('/api/admin/questions/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          csvText,
          classLevel: 8,
          subjectId: 'mathematics'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCsvStatus(`Successfully imported ${data.count} questions!`);
        setTimeout(() => {
          setShowCsvModal(false);
          setCsvStatus('');
          setCsvText('');
          loadQuestions();
        }, 1500);
      } else {
        setCsvStatus(data.error || 'Import failed.');
      }
    } catch (e: any) {
      setCsvStatus(e.message || 'Import error.');
    }
  };

  const filtered = questions.filter((q) => {
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (filterSubject !== 'all' && q.subjectId !== filterSubject) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        q.question.toLowerCase().includes(term) ||
        (q.explanation && q.explanation.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">MCQ Question Bank</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curate multiple-choice assessments with immediate feedback and distractor explanations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search questions by keyword or formula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
          </select>
        </div>
      </div>

      {/* Question List Cards */}
      <div className="space-y-4">
        {filtered.map((q, idx) => (
          <div
            key={q.id || idx}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-cyan-400 font-bold">
                  Class {q.classLevel || 8}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300 capitalize">{q.subjectId || 'mathematics'}</span>
                <span className="text-slate-600">·</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    q.difficulty === 'hard'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      : q.difficulty === 'medium'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {q.difficulty || 'medium'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => handleDuplicate(q)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Duplicate Question"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg"
                  title="Delete Question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{q.question}</h4>
              {q.expression && (
                <div className="my-2 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-cyan-300 font-bold text-xs inline-block">
                  {q.expression}
                </div>
              )}
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {q.options?.map((opt: string, optIdx: number) => {
                const isCorrect = optIdx === q.correctIndex;
                return (
                  <div
                    key={optIdx}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      isCorrect
                        ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>
                      <strong className="text-slate-400 mr-2 font-mono">
                        {String.fromCharCode(65 + optIdx)}.
                      </strong>
                      {opt}
                    </span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <strong className="text-cyan-400 mr-1.5">Feedback &amp; Explanation:</strong>
              {q.explanation}
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add Question to Bank</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Question Prompt</label>
                <textarea
                  rows={2}
                  required
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Math Expression (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 3x + 4 = 19"
                  value={questionForm.expression}
                  onChange={(e) => setQuestionForm({ ...questionForm, expression: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">4 Answer Options &amp; Correct Choice</label>
                {[0, 1, 2, 3].map((optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctIndex"
                      checked={questionForm.correctIndex === optIdx}
                      onChange={() => setQuestionForm({ ...questionForm, correctIndex: optIdx })}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-mono text-slate-400 font-bold">{String.fromCharCode(65 + optIdx)}</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      value={questionForm.options[optIdx]}
                      onChange={(e) => {
                        const copy = [...questionForm.options];
                        copy[optIdx] = e.target.value;
                        setQuestionForm({ ...questionForm, options: copy });
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Answer Explanation &amp; Distractor Feedback</label>
                <textarea
                  rows={2}
                  required
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>Import MCQ Questions via CSV</span>
              </h3>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Paste CSV text in standard format: <br />
              <code className="text-cyan-300 font-mono text-[11px]">
                Question, OptionA, OptionB, OptionC, OptionD, CorrectIndex (0-3), Explanation
              </code>
            </p>

            {csvStatus && (
              <div className="p-3 rounded-lg bg-blue-950 border border-blue-800 text-xs text-cyan-200">
                {csvStatus}
              </div>
            )}

            <textarea
              rows={6}
              placeholder="Question,Option A,Option B,Option C,Option D,0,Explanation..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleImportCsv}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                Execute Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
