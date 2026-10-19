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

  if (isFinished && finalScore !== null) {
    const passed = finalScore >= PASSING_ASSESSMENT_SCORE;

    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="max-w-xl mx-auto text-center">
          {passed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-[#DCFCE7] border-2 border-[#16A34A] mx-auto flex items-center justify-center text-[#16A34A] shadow-sm">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827]">
                Assessment Passed with Mastery!
              </h3>
              <p className="text-[#475569] text-sm">
                You scored <span className="text-[#16A34A] font-bold font-mono text-lg">{finalScore}%</span> (Passing requirement: {PASSING_ASSESSMENT_SCORE}%). The 30% assessment weight has been awarded and the next sub-concept is now unlocked!
              </p>

              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 flex items-center justify-around text-center my-6">
                <div>
                  <div className="text-xs text-[#166534]">Final Score</div>
                  <div className="text-2xl font-bold font-mono text-[#16A34A]">{finalScore}%</div>
                </div>
                <div className="h-8 w-px bg-[#BBF7D0]" />
                <div>
                  <div className="text-xs text-[#166534]">Status</div>
                  <div className="text-sm font-bold text-[#16A34A] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 inline" /> PASSED
                  </div>
                </div>
                <div className="h-8 w-px bg-[#BBF7D0]" />
                <div>
                  <div className="text-xs text-[#166534]">Next Concept</div>
                  <div className="text-sm font-bold text-[#2563EB]">UNLOCKED</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRetake}
                  className="btn-secondary px-5 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Practice Again</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-[#FEF3C7] border-2 border-[#D97706] mx-auto flex items-center justify-center text-[#D97706] shadow-sm">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827]">
                Keep Going! 80% Required to Unlock
              </h3>
              <p className="text-[#475569] text-sm">
                You scored <span className="text-[#D97706] font-bold font-mono text-lg">{finalScore}%</span>. To unlock the subsequent lesson, SciMathenova requires a passing score of at least <span className="font-bold text-[#111827]">{PASSING_ASSESSMENT_SCORE}%</span>.
              </p>

              {/* Revision Recommendations */}
              <div className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-5 text-left my-6 space-y-3">
                <div className="flex items-center gap-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Recommended Revision Points</span>
                </div>
                <ul className="text-xs text-[#475569] space-y-2 list-disc list-inside">
                  <li>Review the balance rule: any operation applied to the left side must be applied identically to the right side.</li>
                  <li>Check negative signs carefully when transposing additive terms across the equals boundary.</li>
                  <li>Verify whether terms with variables cancel correctly before solving constants.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onReviewRequested && (
                  <button
                    onClick={onReviewRequested}
                    className="btn-secondary px-5 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Review Lesson Content</span>
                  </button>
                )}
                <button
                  onClick={handleRetake}
                  className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
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
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
      {/* Header and Progress Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Mastery Evaluation (80% Required to Pass)</span>
          </div>
          <h3 className="text-xl font-bold text-[#111827] mt-1">
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
                    ? 'ring-2 ring-[#93C5FD] bg-[#2563EB] text-white border-[#2563EB]'
                    : isSub
                    ? isCorrect
                      ? 'bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]'
                      : 'bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]'
                    : isAns
                    ? 'bg-[#F1F5FF] border-[#BFDBFE] text-[#2563EB]'
                    : 'bg-[#F8FAFF] border-[#E2E8F0] text-[#94A3B8]'
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
        <div className="text-xs text-[#64748B] uppercase tracking-wider font-semibold mb-2">
          Category: {currentQ.category.toUpperCase()}
        </div>
        <h4 className="text-lg font-semibold text-[#111827] leading-relaxed">
          {currentQ.question}
        </h4>

        {currentQ.expression && (
          <div className="my-3 p-3 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] font-mono text-[#2563EB] font-bold text-base inline-block">
            {currentQ.expression}
          </div>
        )}

        {/* 4 Answer Options */}
        <div className="space-y-3 mt-6">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentSelectedOption === optIdx;
            const isCorrect = optIdx === currentQ.correctIndex;

            let optionStyle =
              'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFF] text-[#475569]';

            if (isCurrentSubmitted) {
              if (isCorrect) {
                optionStyle =
                  'border-[#16A34A] bg-[#DCFCE7] text-[#166534] ring-1 ring-[#16A34A]';
              } else if (isSelected && !isCorrect) {
                optionStyle =
                  'border-[#DC2626] bg-[#FEE2E2] text-[#991B1B] ring-1 ring-[#DC2626]';
              } else {
                optionStyle = 'border-[#E2E8F0] bg-[#F8FAFF] text-[#94A3B8] opacity-60';
              }
            } else if (isSelected) {
              optionStyle =
                'border-[#2563EB] bg-[#EFF6FF] text-[#111827] ring-1 ring-[#2563EB]';
            }

            return (
              <button
                key={optIdx}
                disabled={isCurrentSubmitted}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#F1F5FF] text-[#2563EB] text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                </div>

                {isCurrentSubmitted && (
                  <div>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#DC2626]" />}
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
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1">
                {currentSelectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Correct Answer!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                    <span>Incorrect Choice</span>
                  </>
                )}
              </div>
              <p>{currentQ.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Footer */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#EDF2F7]">
          <div className="text-xs text-[#64748B]">
            {isCurrentSubmitted ? 'Answer submitted' : 'Select an option and submit'}
          </div>

          <div className="flex items-center gap-3">
            {!isCurrentSubmitted ? (
              <button
                disabled={currentSelectedOption === undefined}
                onClick={handleConfirmAnswer}
                className="btn-primary px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
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
