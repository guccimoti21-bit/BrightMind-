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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">80% Completion &amp; Unlocking Rules</h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Configure weighted progression criteria and the mandatory assessment threshold.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {errorStatus && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rules Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <span>Weighted Completion Formula (Sum = 100%)</span>
              </span>

              <span
                className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${
                  isWeightValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                Total: {currentTotalWeight}% / 100%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#475569] font-semibold block mb-1">
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
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] rounded-lg text-[#111827] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#475569] font-semibold block mb-1">
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
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] rounded-lg text-[#111827] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#475569] font-semibold block mb-1">
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
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] rounded-lg text-[#111827] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#475569] font-semibold block mb-1">
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
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] rounded-lg text-[#111827] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDF2F7] space-y-4">
              <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                Passing &amp; Unlocking Thresholds
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#475569] font-semibold block mb-1">
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
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] rounded-lg text-[#2563EB] font-mono font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">Standard: 80%</span>
                </div>

                <div>
                  <label className="text-[#475569] font-semibold block mb-1">
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
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#93C5FD] rounded-lg text-[#16A34A] font-mono font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">Standard: 80%</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#475569]">
                  <input
                    type="checkbox"
                    checked={rules.allowRevisit}
                    onChange={(e) => setRules({ ...rules, allowRevisit: e.target.checked })}
                    className="accent-[#2563EB] rounded w-4 h-4 cursor-pointer"
                  />
                  <span>Allow students to revisit and practice previously unlocked lessons</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDF2F7] flex justify-end">
              <button
                type="submit"
                disabled={!isWeightValid}
                className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Learning Rules</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Simulation & Preview of Learner Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#2563EB]" />
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
                  className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-xs space-y-2 shadow-2xs"
                >
                  <div className="font-bold text-[#111827]">{sc.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Computed Completion:</span>
                    <span className="font-mono font-bold text-[#2563EB] text-xs">
                      {calculatedScore}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EDF2F7]">
                    <span className="text-[#64748B]">Next Sub-concept:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isUnlocked
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
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
