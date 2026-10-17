import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { AssessmentQuestion, PASSING_ASSESSMENT_SCORE } from '../../types/curriculum';
import { useProgress } from '../../context/ProgressContext';

interface AssessmentComponentProps {
  subConceptId: string;
  questions: AssessmentQuestion[];
  onPass?: () => void;
  onReviewRequested?: () => void;
}

export function AssessmentComponent({
  subConceptId,
  questions,
  onPass,
  onReviewRequested
}: AssessmentComponentProps) {
  const { recordAssessmentAttempt, state } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const currentQ = questions[currentIndex];
  const isCurrentSubmitted = submittedQuestions[currentIndex] || false;
  const currentSelectedOption = selectedAnswers[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleConfirmAnswer = () => {
    if (currentSelectedOption === undefined) return;
    setSubmittedQuestions((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++;
        }
      });

      const percentage = Math.round((correctCount / questions.length) * 100);
      setFinalScore(percentage);
      setIsFinished(true);

      const result = recordAssessmentAttempt(subConceptId, percentage);
      if (result.passed && onPass) {
        onPass();
      }
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setIsFinished(false);
    setFinalScore(null);
  };

  const existingProgress = state.progressBySubConcept[subConceptId];

  if (isFinished && finalScore !== null) {
    const passed = finalScore >= PASSING_ASSESSMENT_SCORE;

    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-xl backdrop-blur-md">
        <div className="max-w-xl mx-auto text-center">
          {passed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Assessment Passed with Mastery!
              </h3>
              <p className="text-slate-300 text-sm">
                You scored <span className="text-emerald-400 font-bold font-mono text-lg">{finalScore}%</span> (Passing requirement: {PASSING_ASSESSMENT_SCORE}%). The 30% assessment weight has been awarded and the next sub-concept is now unlocked!
              </p>

              <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-xl p-4 flex items-center justify-around text-center my-6">
                <div>
                  <div className="text-xs text-emerald-300">Final Score</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{finalScore}%</div>
                </div>
                <div className="h-8 w-px bg-emerald-800" />
                <div>
                  <div className="text-xs text-emerald-300">Status</div>
                  <div className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 inline" /> PASSED
                  </div>
                </div>
                <div className="h-8 w-px bg-emerald-800" />
                <div>
                  <div className="text-xs text-emerald-300">Next Concept</div>
                  <div className="text-sm font-bold text-cyan-300">UNLOCKED</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRetake}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Practice Again</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 mx-auto flex items-center justify-center text-amber-400">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Keep Going! 80% Required to Unlock
              </h3>
              <p className="text-slate-300 text-sm">
                You scored <span className="text-amber-400 font-bold font-mono text-lg">{finalScore}%</span>. To unlock the subsequent lesson, BrightMind Learning requires a passing score of at least <span className="font-bold text-white">{PASSING_ASSESSMENT_SCORE}%</span>.
              </p>

              {/* Revision Recommendations */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-left my-6 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Recommended Revision Points</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Review the balance rule: any operation applied to the left side must be applied identically to the right side.</li>
                  <li>Check negative signs carefully when transposing additive terms across the equals boundary.</li>
                  <li>Verify whether terms with variables cancel correctly before solving constants.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onReviewRequested && (
                  <button
                    onClick={onReviewRequested}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Review Lesson Content</span>
                  </button>
                )}
                <button
                  onClick={handleRetake}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      {/* Header and Progress Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Mastery Evaluation (80% Required to Pass)</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Question {currentIndex + 1} of {questions.length}
          </h3>
        </div>

        {/* Question Counter Dots */}
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => {
            const isSub = submittedQuestions[i];
            const isAns = selectedAnswers[i] !== undefined;
            const isCorrect = isSub && selectedAnswers[i] === questions[i].correctIndex;
            return (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center border transition-all ${
                  i === currentIndex
                    ? 'ring-2 ring-cyan-400 bg-blue-600 text-white border-blue-400'
                    : isSub
                    ? isCorrect
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-rose-950 border-rose-600 text-rose-300'
                    : isAns
                    ? 'bg-slate-800 border-slate-600 text-slate-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Body */}
      <div className="mt-6 max-w-3xl">
        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Category: {currentQ.category.toUpperCase()}
        </div>
        <h4 className="text-lg font-semibold text-white leading-relaxed">
          {currentQ.question}
        </h4>

        {currentQ.expression && (
          <div className="my-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-cyan-300 font-bold text-base inline-block">
            {currentQ.expression}
          </div>
        )}

        {/* 4 Answer Options */}
        <div className="space-y-3 mt-6">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentSelectedOption === optIdx;
            const isCorrect = optIdx === currentQ.correctIndex;

            let optionStyle =
              'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 text-slate-300';

            if (isCurrentSubmitted) {
              if (isCorrect) {
                optionStyle =
                  'border-emerald-500 bg-emerald-950/80 text-emerald-200 ring-1 ring-emerald-500';
              } else if (isSelected && !isCorrect) {
                optionStyle =
                  'border-rose-500 bg-rose-950/80 text-rose-200 ring-1 ring-rose-500';
              } else {
                optionStyle = 'border-slate-800 bg-slate-950/40 text-slate-500 opacity-60';
              }
            } else if (isSelected) {
              optionStyle =
                'border-cyan-500 bg-blue-950/80 text-white ring-1 ring-cyan-500';
            }

            return (
              <button
                key={optIdx}
                disabled={isCurrentSubmitted}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                </div>

                {isCurrentSubmitted && (
                  <div>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Feedback */}
        <AnimatePresence>
          {isCurrentSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl border text-xs leading-relaxed ${
                currentSelectedOption === currentQ.correctIndex
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-700/60 text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1">
                {currentSelectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Correct Answer!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Incorrect Choice</span>
                  </>
                )}
              </div>
              <p>{currentQ.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Footer */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isCurrentSubmitted ? 'Answer submitted' : 'Select an option and submit'}
          </div>

          <div className="flex items-center gap-3">
            {!isCurrentSubmitted ? (
              <button
                disabled={currentSelectedOption === undefined}
                onClick={handleConfirmAnswer}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Final Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
