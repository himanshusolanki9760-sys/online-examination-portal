import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Eraser,
  GraduationCap,
  Grid,
  LogOut,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react';
import { CANDIDATE_PORTRAITS } from '../../data/mockAssessments';
import { Assessment, ExamQuestion, ExamSubmissionSummary } from '../../types/assessment';
import { CandidatePortrait } from '../shared/CandidatePortrait';
import { CountdownTimerRing, formatTimeClock } from '../shared/CountdownTimerRing';

interface LiveExamConsoleProps {
  assessment: Assessment;
  questions: ExamQuestion[];
  initialSeconds: number;
  onExitPreview: () => void;
  onSubmitExam: (summary: ExamSubmissionSummary) => void;
}

export const LiveExamConsole: React.FC<LiveExamConsoleProps> = ({
  assessment,
  questions,
  initialSeconds,
  onExitPreview,
  onSubmitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [confirmCheck, setConfirmCheck] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const finalizeSubmission = useCallback(() => {
    let earned = 0;
    let possible = 0;
    questions.forEach((q) => {
      possible += q.points;
      if (answers[q.id] === q.correctOptionId) {
        earned += q.points;
      }
    });
    const scorePercent = possible > 0 ? Math.round((earned / possible) * 100) : 0;
    const elapsedSeconds = Math.max(1, initialSeconds - remainingSeconds);

    onSubmitExam({
      assessment,
      questions,
      answers,
      flaggedIds,
      elapsedSeconds,
      totalPointsEarned: earned,
      totalPointsPossible: possible,
      scorePercent,
      passed: scorePercent >= assessment.passingScorePercent,
      submittedAt: 'Just now',
    });
  }, [answers, assessment, flaggedIds, initialSeconds, onSubmitExam, questions, remainingSeconds]);

  // Countdown tick
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Auto-submit if clock reaches zero
  useEffect(() => {
    if (remainingSeconds === 0) {
      finalizeSubmission();
    }
  }, [remainingSeconds, finalizeSubmission]);

  const selectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    },
    [currentQuestion]
  );

  const toggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    setFlaggedIds((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  }, [currentQuestion]);

  const clearSelection = useCallback(() => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  }, [currentQuestion]);

  // Keyboard shortcuts: 1-4 / A-D select, Left/Right navigate, F flags
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinishModalOpen) return;
      if (!currentQuestion) return;
      const key = e.key.toLowerCase();
      if (key === 'arrowright') {
        setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
      } else if (key === 'arrowleft') {
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (key === 'f') {
        toggleFlag();
      } else if (['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(key)) {
        const idxMap: Record<string, number> = {
          '1': 0,
          a: 0,
          '2': 1,
          b: 1,
          '3': 2,
          c: 2,
          '4': 3,
          d: 3,
        };
        const target = currentQuestion.options[idxMap[key]];
        if (target) selectOption(target.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentQuestion, isFinishModalOpen, selectOption, toggleFlag, totalQuestions]);

  const stats = useMemo(() => {
    const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
    const flaggedCount = questions.filter((q) => flaggedIds.includes(q.id)).length;
    const unvisitedOrUnanswered = totalQuestions - answeredCount;
    return { answeredCount, flaggedCount, unvisitedOrUnanswered };
  }, [answers, flaggedIds, questions, totalQuestions]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 max-w-md text-center">
          <p className="text-base font-semibold text-[#142B4D]">
            No questions loaded for this assessment.
          </p>
          <button
            type="button"
            onClick={onExitPreview}
            className="mt-4 px-4 py-2 rounded-md bg-[#2563EB] text-white text-sm font-semibold"
          >
            Return to Workspace
          </button>
        </div>
      </div>
    );
  }

  const isCurrentFlagged = flaggedIds.includes(currentQuestion.id);
  const selectedOptionId = answers[currentQuestion.id];

  const paletteContent = (
    <div className="space-y-5">
      {/* Countdown Timer Widget */}
      <CountdownTimerRing
        remainingSeconds={remainingSeconds}
        totalSeconds={initialSeconds}
      />

      {/* Proctor Webcam Self-View with Glass Overlay */}
      <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#0F172A] aspect-[16/10]">
        <CandidatePortrait
          src={CANDIDATE_PORTRAITS.elena}
          name="Elena Vance"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 right-2 proctor-glass border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#142B4D]">
            <Video className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Proctor Active</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#047857]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        </div>
      </div>

      {/* Question Grid Palette */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
            Question Palette
          </p>
          <span className="text-xs font-mono tabular-nums text-[#475569]">
            {stats.answeredCount}/{totalQuestions} answered
          </span>
        </div>

        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))' }}
        >
          {questions.map((q, idx) => {
            const isActive = idx === currentIndex;
            const isAnswered = Boolean(answers[q.id]);
            const isFlagged = flaggedIds.includes(q.id);

            let tileClasses =
              'bg-[#F8FAFC] border border-[#CBD5E1] text-[#64748B] hover:border-[#94A3B8]';
            if (isActive) {
              tileClasses =
                'border-2 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]';
            } else if (isFlagged && isAnswered) {
              tileClasses = 'bg-[#D97706] text-white border border-[#D97706]';
            } else if (isFlagged) {
              tileClasses = 'bg-[#D97706] text-white border border-[#D97706]';
            } else if (isAnswered) {
              tileClasses = 'bg-[#059669] text-white border border-[#059669]';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsMobilePaletteOpen(false);
                }}
                aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ''}${
                  isFlagged ? ', marked for review' : ''
                }`}
                className={`relative h-10 w-full rounded-md text-xs font-semibold tabular-nums flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#06B6D4] ${tileClasses}`}
              >
                <span>{idx + 1}</span>
                {isFlagged && isAnswered && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#059669] ring-2 ring-white"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Palette State Legend */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-4 pt-4 border-t border-[#E2E8F0] text-[11px] text-[#475569]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#059669] shrink-0" />
            <span>Answered ({stats.answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#D97706] shrink-0" />
            <span>Review ({stats.flaggedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border-2 border-[#2563EB] bg-[#EFF6FF] shrink-0" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border border-[#CBD5E1] bg-[#F8FAFC] shrink-0" />
            <span>Unvisited ({stats.unvisitedOrUnanswered})</span>
          </div>
        </div>
      </div>

      {/* Destructive Finish Exam CTA */}
      <div className="pt-2 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => {
            setConfirmCheck(false);
            setIsFinishModalOpen(true);
          }}
          className="w-full py-2.5 px-4 rounded-md bg-[#DC2626] hover:bg-[#B91C1C] text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4]"
        >
          Finish & Submit Exam
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Deep Navy Master Exam Chrome Header */}
      <header className="bg-[#142B4D] text-white h-14 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-30 elevation-mid">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              <span className="font-mono text-[#06B6D4] mr-2">{assessment.code}</span>
              <span>{assessment.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline text-xs text-[#CBD5E1] font-mono">
            Elena Vance · CAN-2026-0841
          </span>
          <button
            type="button"
            onClick={() => setIsMobilePaletteOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-xs font-semibold text-white whitespace-nowrap"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {currentIndex + 1}/{totalQuestions}
            </span>
          </button>
          <button
            type="button"
            onClick={onExitPreview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Console</span>
          </button>
        </div>
      </header>

      {/* Main Asymmetric Split Console */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Primary Question Viewport (8-9 columns equivalent) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Question Stage Card */}
            <article className="bg-white border border-[#E2E8F0] rounded-2xl elevation-low p-6 sm:p-8 space-y-6">
              {/* Top Question Metadata & Review Flag */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                    Question {currentIndex + 1} of {totalQuestions}
                    <span aria-hidden="true"> · </span>
                    {currentQuestion.section}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5 tabular-nums">
                    {currentQuestion.code} · {currentQuestion.points} Points ·{' '}
                    {currentQuestion.difficulty}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleFlag}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors whitespace-nowrap ${
                    isCurrentFlagged
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                      : 'bg-white border-[#CBD5E1] text-[#142B4D] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      isCurrentFlagged ? 'fill-[#D97706] text-[#D97706]' : 'text-[#475569]'
                    }`}
                  />
                  <span>{isCurrentFlagged ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Optional Statutory / Code Excerpt */}
              {currentQuestion.contextExcerpt && (
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] mb-1.5">
                    {currentQuestion.contextExcerpt.title}
                  </p>
                  <p
                    className={`text-sm leading-6 text-[#0F172A] ${
                      currentQuestion.contextExcerpt.isCode
                        ? 'font-mono whitespace-pre-wrap text-[13px]'
                        : 'italic'
                    }`}
                  >
                    {currentQuestion.contextExcerpt.body}
                  </p>
                </div>
              )}

              {/* Question Stem (18px body-lg for multi-hour legibility) */}
              <div className="max-w-[70ch]">
                <p className="text-[18px] leading-[28px] font-normal text-[#0F172A]">
                  {currentQuestion.stem}
                </p>
              </div>

              {/* Full-Width MCQ Option Cards */}
              <div className="space-y-3" role="radiogroup" aria-label="Answer choices">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => selectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-lg border-[1.5px] flex items-start gap-3.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4] ${
                        isSelected
                          ? 'border-[#2563EB] bg-[#EFF6FF]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {/* 20px Radio Glyph */}
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-[#2563EB] text-white'
                            : 'border-[1.5px] border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>

                      <div className="flex-1 text-[15px] leading-6 text-[#0F172A]">
                        <span className="font-semibold text-[#142B4D] mr-2">
                          {opt.label}.
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={!selectedOptionId}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                      selectedOptionId
                        ? 'text-[#475569] hover:text-[#142B4D] hover:bg-[#F1F5F9]'
                        : 'text-[#94A3B8] cursor-not-allowed'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear Selection</span>
                  </button>
                  <span className="hidden sm:inline text-xs text-[#94A3B8]">
                    Keys 1–4 select · F flags
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#142B4D] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                      }
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4]"
                    >
                      <span>Save & Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmCheck(false);
                        setIsFinishModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#059669] hover:bg-[#047857] text-sm font-semibold text-white transition-colors"
                    >
                      <span>Review & Submit</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          </div>
        </main>

        {/* Desktop Fixed 320px Right-Hand Telemetry & Question Palette Panel */}
        <aside className="hidden lg:block w-[320px] shrink-0 bg-white border-l border-[#E2E8F0] p-5 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          {paletteContent}
        </aside>
      </div>

      {/* Mobile Compact Persistent Bottom Status Bar (<15% viewport height) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between gap-3 elevation-mid">
        <CountdownTimerRing
          remainingSeconds={remainingSeconds}
          totalSeconds={initialSeconds}
          compact
        />

        <button
          type="button"
          onClick={() => setIsMobilePaletteOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#142B4D]"
        >
          <Grid className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Palette ({stats.answeredCount}/{totalQuestions})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setConfirmCheck(false);
            setIsFinishModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-md bg-[#DC2626] text-xs font-semibold text-white whitespace-nowrap"
        >
          Finish
        </button>
      </div>

      {/* Mobile / Tablet Off-Canvas Question Palette Sheet */}
      {isMobilePaletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#142B4D]/45 backdrop-blur-[2px]"
            onClick={() => setIsMobilePaletteOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xs bg-white h-full p-5 overflow-y-auto elevation-high">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
              <span className="font-display text-base font-bold text-[#142B4D]">
                Exam Navigation
              </span>
              <button
                type="button"
                onClick={() => setIsMobilePaletteOpen(false)}
                className="p-1.5 rounded-md text-[#475569] hover:bg-[#F8FAFC]"
                aria-label="Close palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {paletteContent}
          </div>
        </div>
      )}

      {/* Double-Confirmation Finish Exam Modal */}
      {isFinishModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142B4D]/50 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finish-exam-title"
        >
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-md elevation-high overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="finish-exam-title"
                    className="font-display text-lg font-bold text-[#142B4D]"
                  >
                    Confirm Final Exam Submission
                  </h2>
                  <p className="text-sm text-[#475569] mt-1">
                    Once submitted, answers are locked and transmitted for official scoring. Time remaining:{' '}
                    <span className="font-mono font-semibold text-[#142B4D] tabular-nums">
                      {formatTimeClock(remainingSeconds)}
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Attempt Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <div>
                  <p className="font-mono text-xl font-bold text-[#059669] tabular-nums">
                    {stats.answeredCount}
                  </p>
                  <p className="text-xs text-[#475569] mt-0.5">Answered</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-[#D97706] tabular-nums">
                    {stats.flaggedCount}
                  </p>
                  <p className="text-xs text-[#475569] mt-0.5">Flagged</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-[#64748B] tabular-nums">
                    {stats.unvisitedOrUnanswered}
                  </p>
                  <p className="text-xs text-[#475569] mt-0.5">Unanswered</p>
                </div>
              </div>

              {/* Explicit Double-Confirmation Checkbox */}
              <button
                type="button"
                onClick={() => setConfirmCheck((c) => !c)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  confirmCheck
                    ? 'border-[#DC2626] bg-[#FEF2F2]/60'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    confirmCheck
                      ? 'bg-[#DC2626] text-white'
                      : 'border border-[#CBD5E1] bg-white'
                  }`}
                >
                  {confirmCheck && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs font-semibold text-[#142B4D]">
                  I have reviewed my flagged items and wish to submit permanently.
                </span>
              </button>
            </div>

            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFinishModalOpen(false)}
                className="px-4 py-2 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#142B4D] hover:bg-[#F8FAFC]"
              >
                Return to Exam
              </button>
              <button
                type="button"
                disabled={!confirmCheck}
                onClick={() => {
                  setIsFinishModalOpen(false);
                  finalizeSubmission();
                }}
                className="px-4 py-2 rounded-md bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] text-sm font-semibold text-white transition-colors"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
