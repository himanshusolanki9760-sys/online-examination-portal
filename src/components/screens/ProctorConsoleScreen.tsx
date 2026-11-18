import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  MessageSquare,
  Pause,
  Play,
  Send,
  ShieldAlert,
  Video,
  Wifi,
} from 'lucide-react';
import { IntegrityStatus, LiveProctorSession } from '../../types/assessment';
import { CandidatePortrait } from '../shared/CandidatePortrait';
import { formatTimeClock } from '../shared/CountdownTimerRing';
import { StatusBadge } from '../shared/StatusBadge';

interface ProctorConsoleScreenProps {
  sessions: LiveProctorSession[];
  onTogglePause: (sessionId: string) => void;
  onUpdateSessionStatus: (sessionId: string, status: IntegrityStatus) => void;
  onSendNotice: (sessionId: string, message: string) => void;
}

export const ProctorConsoleScreen: React.FC<ProctorConsoleScreenProps> = ({
  sessions,
  onTogglePause,
  onUpdateSessionStatus,
  onSendNotice,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'flagged' | 'critical'>('all');
  const [selectedId, setSelectedId] = useState<string>(sessions[0]?.id ?? '');
  const [noticeText, setNoticeText] = useState('');

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterTab === 'flagged') return s.integrityStatus === 'Flagged';
      if (filterTab === 'critical') return s.remainingSeconds <= 600;
      return true;
    });
  }, [sessions, filterTab]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === selectedId) ?? filteredSessions[0] ?? sessions[0],
    [sessions, selectedId, filteredSessions]
  );

  const handleDispatchNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !noticeText.trim()) return;
    onSendNotice(activeSession.id, noticeText.trim());
    setNoticeText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[32px] sm:leading-10 font-bold tracking-[-0.02em] text-[#142B4D]">
            Live Proctoring Console
          </h1>
          <p className="text-[15px] text-[#475569] mt-1">
            Real-time webcam telemetry, active countdown monitoring, and immediate invigilator intervention.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg w-fit">
          {[
            { id: 'all', label: `All Feeds (${sessions.length})` },
            {
              id: 'flagged',
              label: `Flagged (${sessions.filter((s) => s.integrityStatus === 'Flagged').length})`,
            },
            {
              id: 'critical',
              label: `Under 10m (${sessions.filter((s) => s.remainingSeconds <= 600).length})`,
            },
          ].map((tab) => {
            const active = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as typeof filterTab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#142B4D] shadow-xs'
                    : 'text-[#475569] hover:text-[#142B4D]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Asymmetric Split View: Feed Grid + Fixed Inspection Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Candidate Feeds Grid */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.map((session) => {
            const isSelected = activeSession?.id === session.id;
            const isCritical = session.remainingSeconds <= 120;
            const isWarning = !isCritical && session.remainingSeconds <= 600;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedId(session.id)}
                className={`text-left bg-white rounded-xl overflow-hidden border transition-all duration-150 elevation-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4] ${
                  isSelected
                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                {/* Webcam Stage with Proctor Glass Overlay */}
                <div className="relative aspect-[4/3] bg-[#0F172A] overflow-hidden">
                  <CandidatePortrait
                    src={session.portraitUrl}
                    name={session.candidateName}
                    className="w-full h-full object-cover"
                  />

                  {/* Top Glass Telemetry Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="proctor-glass border border-[#E2E8F0] rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold text-[#142B4D]">
                      <Video className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>{session.isPaused ? 'PAUSED' : 'REC LIVE'}</span>
                    </div>

                    <div
                      className={`proctor-glass border rounded-md px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${
                        isCritical
                          ? 'border-[#FECACA] text-[#DC2626]'
                          : isWarning
                            ? 'border-[#FDE68A] text-[#D97706]'
                            : 'border-[#E2E8F0] text-[#142B4D]'
                      }`}
                    >
                      {formatTimeClock(session.remainingSeconds)}
                    </div>
                  </div>

                  {/* Bottom Glass Identity Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 proctor-glass border border-[#E2E8F0] rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#142B4D] truncate">
                        {session.candidateName}
                      </p>
                      <p className="text-xs text-[#475569] font-mono truncate">
                        {session.candidateId} · Q{session.currentQuestionIndex}/{session.totalQuestions}
                      </p>
                    </div>
                    <StatusBadge
                      variant={
                        session.integrityStatus === 'Verified'
                          ? 'verified'
                          : session.integrityStatus === 'Flagged'
                            ? 'flagged'
                            : 'nominal'
                      }
                    />
                  </div>
                </div>

                {/* Card Footer Metrics */}
                <div className="px-4 py-3 flex items-center justify-between text-xs text-[#475569] bg-white">
                  <span className="truncate max-w-[65%]">{session.assessmentTitle}</span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums shrink-0">
                    <Wifi className="w-3.5 h-3.5 text-[#06B6D4]" />
                    {session.networkLatencyMs}ms
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right-Hand Proctor Inspection Panel */}
        {activeSession && (
          <aside className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-xl elevation-low overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Active Inspection
                </p>
                <h2 className="font-display text-lg font-bold text-[#142B4D] mt-0.5">
                  {activeSession.candidateName}
                </h2>
                <p className="text-xs font-mono text-[#475569] mt-0.5">
                  {activeSession.candidateId}
                </p>
              </div>
              <StatusBadge
                variant={
                  activeSession.integrityStatus === 'Verified'
                    ? 'verified'
                    : activeSession.integrityStatus === 'Flagged'
                      ? 'flagged'
                      : 'nominal'
                }
              />
            </div>

            <div className="p-5 space-y-5">
              {/* Live Progress & Clock Row */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569]">
                    Clock
                  </p>
                  <p className="font-mono text-base font-bold tabular-nums text-[#142B4D] mt-0.5">
                    {formatTimeClock(activeSession.remainingSeconds)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569]">
                    Answered
                  </p>
                  <p className="font-mono text-base font-bold tabular-nums text-[#142B4D] mt-0.5">
                    {activeSession.answeredCount}/{activeSession.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569]">
                    Audio
                  </p>
                  <p className="font-mono text-base font-bold tabular-nums text-[#142B4D] mt-0.5">
                    {activeSession.audioLevelDb} dB
                  </p>
                </div>
              </div>

              {/* Invigilator Controls */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onTogglePause(activeSession.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white border border-[#CBD5E1] text-xs font-semibold text-[#142B4D] hover:bg-[#F8FAFC]"
                >
                  {activeSession.isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Resume Clock</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Pause Clock</span>
                    </>
                  )}
                </button>

                {activeSession.integrityStatus === 'Flagged' ? (
                  <button
                    type="button"
                    onClick={() => onUpdateSessionStatus(activeSession.id, 'Verified')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#059669] hover:bg-[#047857] text-xs font-semibold text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Clear Flag</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUpdateSessionStatus(activeSession.id, 'Flagged')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white border border-[#FDE68A] text-xs font-semibold text-[#B45309] hover:bg-[#FFFBEB]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Flag Session</span>
                  </button>
                )}
              </div>

              {/* Event Log */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] mb-2.5">
                  Session Event Timeline
                </p>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {activeSession.events.map((ev) => (
                    <div key={ev.id} className="text-xs leading-5 pb-2.5 border-b border-[#E2E8F0] last:border-b-0">
                      <span className="font-mono font-semibold text-[#475569] tabular-nums mr-2">
                        {ev.timestamp}
                      </span>
                      <span
                        className={
                          ev.type === 'warning'
                            ? 'text-[#B45309] font-medium'
                            : ev.type === 'resolved'
                              ? 'text-[#047857] font-medium'
                              : 'text-[#0F172A]'
                        }
                      >
                        {ev.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Proctor Notice */}
              <form onSubmit={handleDispatchNotice} className="pt-2 border-t border-[#E2E8F0]">
                <label
                  htmlFor="proctor-notice-input"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#142B4D] mb-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Direct Candidate Notice</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="proctor-notice-input"
                    type="text"
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                    placeholder="e.g., Please keep eyes within screen frame"
                    className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center p-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white shrink-0"
                    aria-label="Send proctor notice"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
