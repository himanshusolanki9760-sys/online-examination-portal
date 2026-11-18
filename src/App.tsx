import { useEffect, useMemo, useState } from 'react';
import { Menu, PlayCircle } from 'lucide-react';
import {
  INITIAL_ASSESSMENTS,
  INITIAL_CANDIDATE_LEDGER,
  INITIAL_PROCTOR_SESSIONS,
  INITIAL_QUESTIONS,
} from './data/mockAssessments';
import {
  Assessment,
  CandidateLedgerEntry,
  ExamQuestion,
  ExamSubmissionSummary,
  IntegrityStatus,
  LiveProctorSession,
  WorkspaceScreen,
} from './types/assessment';
import { AdminSidebar } from './components/shared/AdminSidebar';
import { AssessmentsDashboard } from './components/screens/AssessmentsDashboard';
import { QuestionBankScreen } from './components/screens/QuestionBankScreen';
import { CandidateLedgerScreen } from './components/screens/CandidateLedgerScreen';
import { ProctorConsoleScreen } from './components/screens/ProctorConsoleScreen';
import { ExamBriefingScreen } from './components/screens/ExamBriefingScreen';
import { LiveExamConsole } from './components/screens/LiveExamConsole';
import { ExamResultsScreen } from './components/screens/ExamResultsScreen';

const SCREEN_BREADCRUMBS: Record<WorkspaceScreen, string> = {
  assessments: 'Assessment Operations',
  'question-bank': 'Question Bank & Rubrics',
  'candidate-ledger': 'Candidate Ledger',
  'proctor-console': 'Live Proctoring Console',
  'exam-briefing': 'Pre-Exam Briefing',
  'live-exam': 'Live Exam Console',
  'exam-results': 'Score Report & Review',
};

export function App() {
  const [activeScreen, setActiveScreen] = useState<WorkspaceScreen>('assessments');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [assessments, setAssessments] = useState<Assessment[]>(INITIAL_ASSESSMENTS);
  const [questions, setQuestions] = useState<ExamQuestion[]>(INITIAL_QUESTIONS);
  const [ledger, setLedger] = useState<CandidateLedgerEntry[]>(INITIAL_CANDIDATE_LEDGER);
  const [proctorSessions, setProctorSessions] = useState<LiveProctorSession[]>(
    INITIAL_PROCTOR_SESSIONS
  );

  const [selectedExamId, setSelectedExamId] = useState<string>(INITIAL_ASSESSMENTS[0].id);
  const [examStartSeconds, setExamStartSeconds] = useState<number>(2700);
  const [lastSubmission, setLastSubmission] = useState<ExamSubmissionSummary | null>(null);

  // Live proctor countdown ticks every second
  useEffect(() => {
    const interval = window.setInterval(() => {
      setProctorSessions((prev) =>
        prev.map((session) => {
          if (session.isPaused || session.remainingSeconds <= 0) return session;
          return {
            ...session,
            remainingSeconds: session.remainingSeconds - 1,
          };
        })
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const liveFlaggedCount = useMemo(
    () => proctorSessions.filter((s) => s.integrityStatus === 'Flagged').length,
    [proctorSessions]
  );

  const handleCreateAssessment = (created: Assessment) => {
    setAssessments((prev) => [created, ...prev]);
  };

  const handleAddQuestion = (newQuestion: ExamQuestion) => {
    setQuestions((prev) => [...prev, newQuestion]);
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === newQuestion.assessmentId
          ? { ...a, questionCount: a.questionCount + 1 }
          : a
      )
    );
  };

  const handleUpdateLedgerIntegrity = (
    entryId: string,
    status: IntegrityStatus,
    note?: string
  ) => {
    setLedger((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              integrityStatus: status,
              proctorNotes: note !== undefined ? note : entry.proctorNotes,
            }
          : entry
      )
    );
  };

  const handleToggleProctorPause = (sessionId: string) => {
    const nowTime = new Date().toTimeString().slice(0, 8);
    setProctorSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const nextPaused = !session.isPaused;
        return {
          ...session,
          isPaused: nextPaused,
          events: [
            {
              id: `ev-${Date.now()}`,
              timestamp: nowTime,
              type: 'info',
              message: nextPaused
                ? 'Exam clock paused by invigilator.'
                : 'Exam clock resumed by invigilator.',
            },
            ...session.events,
          ],
        };
      })
    );
  };

  const handleUpdateProctorStatus = (sessionId: string, status: IntegrityStatus) => {
    const nowTime = new Date().toTimeString().slice(0, 8);
    setProctorSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          integrityStatus: status,
          events: [
            {
              id: `ev-${Date.now()}`,
              timestamp: nowTime,
              type: status === 'Verified' ? 'resolved' : 'warning',
              message:
                status === 'Verified'
                  ? 'Session flag cleared and marked Verified by invigilator.'
                  : 'Session flagged for secondary audit review.',
            },
            ...session.events,
          ],
        };
      })
    );
  };

  const handleSendProctorNotice = (sessionId: string, message: string) => {
    const nowTime = new Date().toTimeString().slice(0, 8);
    setProctorSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          events: [
            {
              id: `ev-${Date.now()}`,
              timestamp: nowTime,
              type: 'info',
              message: `Notice dispatched to candidate: "${message}"`,
            },
            ...session.events,
          ],
        };
      })
    );
  };

  const handleOpenBriefingForExam = (assessmentId: string) => {
    setSelectedExamId(assessmentId);
    setActiveScreen('exam-briefing');
  };

  const handleStartLiveExam = (assessmentId: string, startingSeconds: number) => {
    setSelectedExamId(assessmentId);
    setExamStartSeconds(startingSeconds);
    setActiveScreen('live-exam');
  };

  const activeExamAssessment = useMemo(
    () => assessments.find((a) => a.id === selectedExamId) ?? assessments[0],
    [assessments, selectedExamId]
  );

  const activeExamQuestions = useMemo(() => {
    const matching = questions.filter((q) => q.assessmentId === activeExamAssessment.id);
    if (matching.length > 0) return matching;
    return questions.slice(0, 6);
  }, [activeExamAssessment, questions]);

  const handleSubmitExam = (summary: ExamSubmissionSummary) => {
    setLastSubmission(summary);
    const newLedgerRow: CandidateLedgerEntry = {
      id: `led-${Date.now()}`,
      candidateName: 'Elena Vance',
      candidateId: 'CAN-2026-0841',
      email: 'e.vance@meridian.edu',
      assessmentId: summary.assessment.id,
      assessmentTitle: summary.assessment.title,
      submittedAt: 'Nov 18, Just now',
      durationUsedMinutes: Math.max(1, Math.round(summary.elapsedSeconds / 60)),
      scorePercent: summary.scorePercent,
      pointsEarned: summary.totalPointsEarned,
      pointsTotal: summary.totalPointsPossible,
      resultStatus: summary.passed ? 'Passed' : 'Failed',
      integrityStatus: 'Verified',
      flaggedEventsCount: 0,
      proctorNotes: 'Submitted via Live Exam Console with continuous proctor verification.',
    };
    setLedger((prev) => [newLedgerRow, ...prev]);
    setActiveScreen('exam-results');
  };

  // Full-bleed distraction-free Live Exam Console
  if (activeScreen === 'live-exam') {
    return (
      <LiveExamConsole
        assessment={activeExamAssessment}
        questions={activeExamQuestions}
        initialSeconds={examStartSeconds}
        onExitPreview={() => setActiveScreen('exam-briefing')}
        onSubmitExam={handleSubmitExam}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      <AdminSidebar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        liveFlaggedCount={liveFlaggedCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Contextual Top Breadcrumb Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md border border-[#E2E8F0] text-[#142B4D] hover:bg-[#F8FAFC]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[#475569] hidden sm:inline whitespace-nowrap">
                Meridian Assessment
              </span>
              <span className="text-[#CBD5E1] hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-[#142B4D] truncate">
                {SCREEN_BREADCRUMBS[activeScreen]}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeScreen !== 'exam-briefing' && (
              <button
                type="button"
                onClick={() => setActiveScreen('exam-briefing')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#142B4D] hover:bg-[#001635] text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Launch Exam View</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1360px] mx-auto">
            {activeScreen === 'assessments' && (
              <AssessmentsDashboard
                assessments={assessments}
                onCreateAssessment={handleCreateAssessment}
                onLaunchExam={handleOpenBriefingForExam}
                onOpenProctor={() => setActiveScreen('proctor-console')}
              />
            )}

            {activeScreen === 'question-bank' && (
              <QuestionBankScreen
                questions={questions}
                assessments={assessments}
                onAddQuestion={handleAddQuestion}
              />
            )}

            {activeScreen === 'candidate-ledger' && (
              <CandidateLedgerScreen
                entries={ledger}
                onUpdateIntegrity={handleUpdateLedgerIntegrity}
              />
            )}

            {activeScreen === 'proctor-console' && (
              <ProctorConsoleScreen
                sessions={proctorSessions}
                onTogglePause={handleToggleProctorPause}
                onUpdateSessionStatus={handleUpdateProctorStatus}
                onSendNotice={handleSendProctorNotice}
              />
            )}

            {activeScreen === 'exam-briefing' && (
              <ExamBriefingScreen
                assessments={assessments}
                initialAssessmentId={selectedExamId}
                onStartExam={handleStartLiveExam}
              />
            )}

            {activeScreen === 'exam-results' && lastSubmission && (
              <ExamResultsScreen
                summary={lastSubmission}
                onRetakeExam={() => setActiveScreen('exam-briefing')}
                onReturnWorkspace={() => setActiveScreen('assessments')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
