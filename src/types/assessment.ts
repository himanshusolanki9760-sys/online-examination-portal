export type WorkspaceScreen =
  | 'assessments'
  | 'question-bank'
  | 'candidate-ledger'
  | 'proctor-console'
  | 'exam-briefing'
  | 'live-exam'
  | 'exam-results';

export type AssessmentStatus = 'Live Now' | 'Scheduled' | 'Completed';

export type IntegrityStatus = 'Nominal' | 'Flagged' | 'Verified';

export type ResultStatus = 'Passed' | 'Failed';

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  code: string;
  assessmentId: string;
  section: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  points: number;
  stem: string;
  contextExcerpt?: {
    title: string;
    body: string;
    isCode?: boolean;
  };
  options: QuestionOption[];
  correctOptionId: string;
  rationale: string;
}

export interface Assessment {
  id: string;
  code: string;
  title: string;
  department: string;
  cohort: string;
  status: AssessmentStatus;
  durationMinutes: number;
  passingScorePercent: number;
  questionCount: number;
  enrolledCount: number;
  completedCount: number;
  meanScorePercent: number | null;
  scheduledWindow: string;
  proctorMode: 'AI + Human Review' | 'Live Invigilator' | 'Lockdown Browser';
}

export interface CandidateLedgerEntry {
  id: string;
  candidateName: string;
  candidateId: string;
  email: string;
  assessmentId: string;
  assessmentTitle: string;
  submittedAt: string;
  durationUsedMinutes: number;
  scorePercent: number;
  pointsEarned: number;
  pointsTotal: number;
  resultStatus: ResultStatus;
  integrityStatus: IntegrityStatus;
  flaggedEventsCount: number;
  proctorNotes: string;
}

export interface ProctorEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'resolved';
  message: string;
}

export interface LiveProctorSession {
  id: string;
  candidateName: string;
  candidateId: string;
  assessmentTitle: string;
  portraitUrl: string;
  remainingSeconds: number;
  totalSeconds: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  integrityStatus: IntegrityStatus;
  isPaused: boolean;
  cameraActive: boolean;
  audioLevelDb: number;
  networkLatencyMs: number;
  events: ProctorEvent[];
}

export interface ExamSubmissionSummary {
  assessment: Assessment;
  questions: ExamQuestion[];
  answers: Record<string, string>;
  flaggedIds: string[];
  elapsedSeconds: number;
  totalPointsEarned: number;
  totalPointsPossible: number;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
}
