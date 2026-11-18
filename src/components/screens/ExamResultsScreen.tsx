import React from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { ExamSubmissionSummary } from '../../types/assessment';
import { formatTimeClock } from '../shared/CountdownTimerRing';
import { StatusBadge } from '../shared/StatusBadge';

interface ExamResultsScreenProps {
  summary: ExamSubmissionSummary;
  onRetakeExam: () => void;
  onReturnWorkspace: () => void;
}

export const ExamResultsScreen: React.FC<ExamResultsScreenProps> = ({
  summary,
  onRetakeExam,
  onReturnWorkspace,
}) => {
  const { assessment, questions, answers, elapsedSeconds, totalPointsEarned, totalPointsPossible, scorePercent, passed } =
    summary;

  const correctCount = questions.filter((q) => answers[q.id] === q.correctOptionId).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onReturnWorkspace}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#475569] hover:text-[#142B4D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Admin Workspace</span>
        </button>

        <button
          type="button"
          onClick={onRetakeExam}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#142B4D] hover:bg-[#F8FAFC]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Examination</span>
        </button>
      </div>

      {/* Certification Summary Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl elevation-low p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
              Official Score Report · {assessment.code}
            </p>
            <h1 className="font-display text-2xl sm:text-[28px] font-bold text-[#142B4D] mt-1">
              {assessment.title}
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Candidate: Elena Vance (CAN-2026-0841) · Passing Benchmark:{' '}
              <span className="tabular-nums font-semibold">{assessment.passingScorePercent}%</span>
            </p>
          </div>

          <StatusBadge variant={passed ? 'passed' : 'failed'} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-[#E2E8F0]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
              Composite Score
            </p>
            <p
              className={`font-mono text-3xl font-bold tabular-nums mt-1 ${
                passed ? 'text-[#059669]' : 'text-[#DC2626]'
              }`}
            >
              {scorePercent}%
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
              Points Earned
            </p>
            <p className="font-mono text-2xl font-bold text-[#142B4D] tabular-nums mt-1.5">
              {totalPointsEarned} / {totalPointsPossible}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
              Items Correct
            </p>
            <p className="font-mono text-2xl font-bold text-[#142B4D] tabular-nums mt-1.5">
              {correctCount} / {questions.length}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
              Time Elapsed
            </p>
            <p className="font-mono text-2xl font-bold text-[#142B4D] tabular-nums mt-1.5">
              {formatTimeClock(elapsedSeconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Question-by-Question Diagnostic Review */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl elevation-low overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h2 className="font-display text-base font-semibold text-[#142B4D]">
            Item-Level Diagnostic Review
          </h2>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {questions.map((q, idx) => {
            const chosenId = answers[q.id];
            const isCorrect = chosenId === q.correctOptionId;
            const chosenOpt = q.options.find((o) => o.id === chosenId);
            const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

            return (
              <div key={q.id} className="p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[#475569]">
                    <span className="font-mono font-semibold text-[#142B4D]">Q{idx + 1}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{q.section}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="tabular-nums">{q.points} pts</span>
                  </p>
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct (+{q.points} pts)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C]">
                      <XCircle className="w-4 h-4" />
                      <span>{chosenId ? 'Incorrect (0 pts)' : 'Unanswered (0 pts)'}</span>
                    </span>
                  )}
                </div>

                <p className="text-[15px] font-medium text-[#0F172A] leading-6">{q.stem}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-1">
                  <div
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                        : 'bg-[#FEF2F2] border-[#FECACA]'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#475569] mb-1">Your Response</p>
                    <p className="text-[#0F172A]">
                      {chosenOpt ? `${chosenOpt.label}. ${chosenOpt.text}` : 'No option selected'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                    <p className="text-xs font-semibold text-[#475569] mb-1">Authoritative Key</p>
                    <p className="text-[#0F172A]">
                      {correctOpt ? `${correctOpt.label}. ${correctOpt.text}` : ''}
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-5 text-[#475569] pt-1">
                  <span className="font-semibold text-[#142B4D]">Rationale: </span>
                  {q.rationale}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
