import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, CheckCircle2, AlertCircle, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { LearningRules } from '../../../../server/db';

export function AdminRulesView() {
  const { token } = useAdminAuth();
  const [rules, setRules] = useState<LearningRules>({
    lessonWeight: 30,
    activityWeight: 20,
    practiceWeight: 20,
    assessmentWeight: 30,
    minAssessmentScore: 80,
    minCompletionScore: 80,
    allowRevisit: true,
    questionsPerAssessment: 5,
    maxRetries: 0
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [errorStatus, setErrorStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Load rules
  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/rules', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRules(data);
        }
      } catch (e) {
        console.error('Error fetching rules:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const currentTotalWeight =
    Number(rules.lessonWeight) +
    Number(rules.activityWeight) +
    Number(rules.practiceWeight) +
    Number(rules.assessmentWeight);

  const isWeightValid = currentTotalWeight === 100;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('');
    setErrorStatus('');

    if (!isWeightValid) {
      setErrorStatus(`Total completion weights must equal 100%. Current total: ${currentTotalWeight}%.`);
      return;
    }

    try {
      const res = await fetch('/api/admin/rules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rules)
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus('Pedagogical learning & unlocking rules successfully updated.');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setErrorStatus(data.error || 'Failed to update rules.');
      }
    } catch (err: any) {
      setErrorStatus(err.message || 'Network error.');
    }
  };

  // Sample student scenario calculation for preview
  const sampleScenarios = [
    {
      name: 'Scenario A: Studied Lesson + Finished Activity + Practice (No Quiz yet)',
      lesson: true,
      activity: true,
      practice: true,
      quizPassed: false,
      quizScore: 0
    },
    {
      name: 'Scenario B: All Finished but Quiz Scored 70% (Below 80% passing)',
      lesson: true,
      activity: true,
      practice: true,
      quizPassed: false,
      quizScore: 70
    },
    {
      name: 'Scenario C: All Completed + Quiz Passed at 85% (Unlocks Next Sub-concept!)',
      lesson: true,
      activity: true,
      practice: true,
      quizPassed: true,
      quizScore: 85
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">80% Completion &amp; Unlocking Rules</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure weighted progression criteria and the mandatory assessment threshold.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {errorStatus && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rules Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Weighted Completion Formula (Sum = 100%)</span>
              </span>

              <span
                className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${
                  isWeightValid
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                Total: {currentTotalWeight}% / 100%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Lesson Sections Completed (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rules.lessonWeight}
                  onChange={(e) =>
                    setRules({ ...rules, lessonWeight: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Interactive Activity Lab (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rules.activityWeight}
                  onChange={(e) =>
                    setRules({ ...rules, activityWeight: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Guided Practice (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rules.practiceWeight}
                  onChange={(e) =>
                    setRules({ ...rules, practiceWeight: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Final Assessment Weight (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rules.assessmentWeight}
                  onChange={(e) =>
                    setRules({ ...rules, assessmentWeight: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Passing &amp; Unlocking Thresholds
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Minimum Assessment Score to Pass (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={rules.minAssessmentScore}
                    onChange={(e) =>
                      setRules({ ...rules, minAssessmentScore: parseInt(e.target.value, 10) || 80 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: 80%</span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Minimum Overall Sub-concept Completion (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={rules.minCompletionScore}
                    onChange={(e) =>
                      setRules({ ...rules, minCompletionScore: parseInt(e.target.value, 10) || 80 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-300 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: 80%</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={rules.allowRevisit}
                    onChange={(e) => setRules({ ...rules, allowRevisit: e.target.checked })}
                    className="accent-blue-600 rounded w-4 h-4"
                  />
                  <span>Allow students to revisit and practice previously unlocked lessons</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={!isWeightValid}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Learning Rules</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Simulation & Preview of Learner Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Learner Progression Preview</span>
          </h3>

          <div className="space-y-3">
            {sampleScenarios.map((sc, i) => {
              let calculatedScore = 0;
              if (sc.lesson) calculatedScore += rules.lessonWeight;
              if (sc.activity) calculatedScore += rules.activityWeight;
              if (sc.practice) calculatedScore += rules.practiceWeight;
              if (sc.quizPassed && sc.quizScore >= rules.minAssessmentScore) {
                calculatedScore += rules.assessmentWeight;
              }

              const isUnlocked =
                calculatedScore >= rules.minCompletionScore &&
                sc.quizPassed &&
                sc.quizScore >= rules.minAssessmentScore;

              return (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2"
                >
                  <div className="font-bold text-white">{sc.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Computed Completion:</span>
                    <span className="font-mono font-bold text-cyan-300 text-xs">
                      {calculatedScore}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Next Sub-concept:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isUnlocked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isUnlocked ? '✓ UNLOCKED' : '🔒 REMAINS LOCKED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
