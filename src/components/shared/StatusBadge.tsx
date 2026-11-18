import React from 'react';
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Clock,
  Radio,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export type SemanticBadgeVariant =
  | 'passed'
  | 'failed'
  | 'answered'
  | 'review'
  | 'pending'
  | 'flagged'
  | 'verified'
  | 'nominal'
  | 'live'
  | 'scheduled'
  | 'completed';

interface StatusBadgeProps {
  variant: SemanticBadgeVariant;
  label?: string;
}

const VARIANT_CONFIG: Record<
  SemanticBadgeVariant,
  {
    defaultLabel: string;
    classes: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  passed: {
    defaultLabel: 'Passed',
    classes: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
    icon: CheckCircle2,
  },
  failed: {
    defaultLabel: 'Failed',
    classes: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
    icon: XCircle,
  },
  answered: {
    defaultLabel: 'Answered',
    classes: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    icon: CheckCircle2,
  },
  review: {
    defaultLabel: 'Marked for Review',
    classes: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    icon: Bookmark,
  },
  pending: {
    defaultLabel: 'Pending',
    classes: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    icon: Clock,
  },
  flagged: {
    defaultLabel: 'Flagged',
    classes: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    icon: AlertTriangle,
  },
  verified: {
    defaultLabel: 'Verified',
    classes: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    icon: ShieldCheck,
  },
  nominal: {
    defaultLabel: 'Nominal',
    classes: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    icon: CheckCircle2,
  },
  live: {
    defaultLabel: 'Live Now',
    classes: 'bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]',
    icon: Radio,
  },
  scheduled: {
    defaultLabel: 'Scheduled',
    classes: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    icon: Clock,
  },
  completed: {
    defaultLabel: 'Completed',
    classes: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    icon: CheckCircle2,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, label }) => {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold leading-4 whitespace-nowrap shrink-0 ${config.classes}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label ?? config.defaultLabel}</span>
    </span>
  );
};
