import React from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerRingProps {
  remainingSeconds: number;
  totalSeconds: number;
  isPaused?: boolean;
  compact?: boolean;
}

export function formatTimeClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const CountdownTimerRing: React.FC<CountdownTimerRingProps> = ({
  remainingSeconds,
  totalSeconds,
  isPaused = false,
  compact = false,
}) => {
  const safeTotal = Math.max(1, totalSeconds);
  const ratio = Math.min(1, Math.max(0, remainingSeconds / safeTotal));
  const isCritical = remainingSeconds <= 120;
  const isWarning = !isCritical && remainingSeconds <= 600;

  const ringColor = isCritical ? '#DC2626' : isWarning ? '#D97706' : '#06B6D4';
  const textColor = isCritical ? 'text-[#DC2626]' : isWarning ? 'text-[#D97706]' : 'text-[#142B4D]';
  const cardSurface = isCritical
    ? 'bg-[#FEF2F2] border-[#FECACA]'
    : isWarning
      ? 'bg-[#FFFBEB] border-[#FDE68A]'
      : 'bg-white border-[#E2E8F0]';

  const statusText = isPaused
    ? 'Clock Paused'
    : isCritical
      ? 'Final 2 Minutes'
      : isWarning
        ? 'Under 10 Minutes'
        : 'Time Remaining';

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md border ${cardSurface} ${
          isCritical && !isPaused ? 'animate-timer-critical' : ''
        }`}
      >
        <Clock className={`w-4 h-4 ${textColor}`} />
        <span className={`font-mono text-sm font-bold tabular-nums tracking-[0.04em] ${textColor}`}>
          {formatTimeClock(remainingSeconds)}
        </span>
      </div>
    );
  }

  const size = 56;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors duration-200 ${cardSurface}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset,stroke] duration-300"
            />
          </svg>
          <Clock className={`w-4 h-4 absolute ${textColor}`} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.04em] uppercase text-[#475569]">
            {statusText}
          </p>
          <p
            className={`font-mono text-[22px] leading-7 font-bold tabular-nums tracking-[0.04em] mt-0.5 ${textColor} ${
              isCritical && !isPaused ? 'animate-timer-critical' : ''
            }`}
          >
            {formatTimeClock(remainingSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
};
