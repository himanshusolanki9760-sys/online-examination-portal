import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Lock,
  Mic,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { CANDIDATE_PORTRAITS } from '../../data/mockAssessments';
import { Assessment } from '../../types/assessment';
import { CandidatePortrait } from '../shared/CandidatePortrait';

interface ExamBriefingScreenProps {
  assessments: Assessment[];
  initialAssessmentId: string;
  onStartExam: (assessmentId: string, startingSeconds: number) => void;
}

export const ExamBriefingScreen: React.FC<ExamBriefingScreenProps> = ({
  assessments,
  initialAssessmentId,
  onStartExam,
}) => {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(
    assessments.some((a) => a.id === initialAssessmentId)
      ? initialAssessmentId
      : assessments[0]?.id ?? ''
  );
  const [timerPreset, setTimerPreset] = useState<'standard' | 'warning' | 'critical'>('standard');
  const [cameraVerified, setCameraVerified] = useState(true);
  const [audioVerified, setAudioVerified] = useState(true);
  const [policyAccepted, setPolicyAccepted] = useState(true);

  const selectedAssessment =
    assessments.find((a) => a.id === selectedAssessmentId) ?? assessments[0];

  if (!selectedAssessment) return null;

  const computedStartSeconds =
    timerPreset === 'critical'
      ? 110 // 01:50 (Red flashing threshold)
      : timerPreset === 'warning'
        ? 585 // 09:45 (Amber <10m threshold)
        : selectedAssessment.durationMinutes * 60;

  const canBegin = cameraVerified && audioVerified && policyAccepted;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-[32px] sm:leading-10 font-bold tracking-[-0.02em] text-[#142B4D]">
          Candidate Pre-Exam Briefing
        </h1>
        <p className="text-[15px] text-[#475569] mt-1">
          Verify your hardware calibration and review institutional testing rules before the countdown begins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Exam Selection & Rules */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl elevation-low p-6 space-y-6">
          <div>
            <label
              htmlFor="briefing-exam-select"
              className="block text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] mb-2"
            >
              Examination Track
            </label>
            <select
              id="briefing-exam-select"
              value={selectedAssessment.id}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-sm font-semibold text-[#142B4D] focus:outline-none focus:border-[#2563EB]"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#E2E8F0]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                Duration
              </p>
              <p className="font-mono text-lg font-bold text-[#142B4D] tabular-nums mt-1">
                {selectedAssessment.durationMinutes} min
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                Passing Score
              </p>
              <p className="font-mono text-lg font-bold text-[#142B4D] tabular-nums mt-1">
                {selectedAssessment.passingScorePercent}%
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                Proctoring
              </p>
              <p className="text-sm font-semibold text-[#142B4D] mt-1.5">
                {selectedAssessment.proctorMode}
              </p>
            </div>
          </div>

          {/* Clock Simulation Selector for Testing Timer Thresholds */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] mb-2">
              Session Clock Mode
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'standard',
                  title: 'Full Window',
                  sub: `${selectedAssessment.durationMinutes}:00 · Cyan`,
                },
                {
                  id: 'warning',
                  title: '10m Warning',
                  sub: '09:45 · Amber',
                },
                {
                  id: 'critical',
                  title: 'Final 2 Minutes',
                  sub: '01:50 · Critical',
                },
              ].map((preset) => {
                const active = timerPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTimerPreset(preset.id as typeof timerPreset)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      active
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#142B4D]">{preset.title}</span>
                      <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                    </div>
                    <p className="font-mono text-[11px] text-[#475569] mt-1 tabular-nums">
                      {preset.sub}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Honor & Examination Protocol */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display text-base font-semibold text-[#142B4D]">
              Examination Conduct & Integrity Protocol
            </h2>
            <ul className="space-y-2 text-sm text-[#475569] leading-6">
              <li>
                1. Keep your face centered within the webcam frame throughout the testing window.
              </li>
              <li>
                2. Questions marked for review remain editable until final submission or clock expiration.
              </li>
              <li>
                3. External reference tabs, clipboard pasting, and secondary displays are restricted.
              </li>
            </ul>
          </div>
        </div>

        {/* Right 5 Columns: Hardware & Readiness Verification */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl elevation-low p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] mb-3">
              Webcam & Room Framing Preview
            </p>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#0F172A]">
              <CandidatePortrait
                src={CANDIDATE_PORTRAITS.elena}
                name="Elena Vance"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 proctor-glass border border-[#E2E8F0] rounded-md px-3 py-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#142B4D]">Elena Vance · CAN-2026-0841</span>
                <span className="font-mono text-[#059669] font-semibold">Framing OK</span>
              </div>
            </div>
          </div>

          {/* Interactive Checkboxes */}
          <div className="space-y-2.5">
            {[
              {
                label: 'Camera feed active and well-lit',
                icon: Video,
                checked: cameraVerified,
                toggle: () => setCameraVerified((v) => !v),
              },
              {
                label: 'Microphone ambient level calibrated',
                icon: Mic,
                checked: audioVerified,
                toggle: () => setAudioVerified((v) => !v),
              },
              {
                label: 'I affirm the Academic Integrity & Lockdown Policy',
                icon: Lock,
                checked: policyAccepted,
                toggle: () => setPolicyAccepted((v) => !v),
              },
            ].map((check) => {
              const Icon = check.icon;
              return (
                <button
                  key={check.label}
                  type="button"
                  onClick={check.toggle}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    check.checked
                      ? 'border-[#2563EB] bg-[#EFF6FF]/60'
                      : 'border-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                      check.checked
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white border border-[#CBD5E1]'
                    }`}
                  >
                    {check.checked && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <Icon className="w-4 h-4 text-[#475569] shrink-0" />
                  <span className="text-xs font-semibold text-[#142B4D]">{check.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canBegin}
            onClick={() => onStartExam(selectedAssessment.id, computedStartSeconds)}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4] ${
              canBegin
                ? 'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white'
                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Begin Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
