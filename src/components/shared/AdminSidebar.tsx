import React from 'react';
import {
  BookOpenCheck,
  ClipboardList,
  Eye,
  GraduationCap,
  LayoutDashboard,
  PlayCircle,
  X,
} from 'lucide-react';
import { WorkspaceScreen } from '../../types/assessment';

interface AdminSidebarProps {
  activeScreen: WorkspaceScreen;
  onNavigate: (screen: WorkspaceScreen) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  liveFlaggedCount: number;
}

interface NavItem {
  id: WorkspaceScreen;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeScreen,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  liveFlaggedCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'assessments', label: 'Assessments', icon: LayoutDashboard },
    { id: 'question-bank', label: 'Question Bank', icon: BookOpenCheck },
    { id: 'candidate-ledger', label: 'Candidate Ledger', icon: ClipboardList },
    {
      id: 'proctor-console',
      label: 'Proctor Console',
      icon: Eye,
      badgeCount: liveFlaggedCount > 0 ? liveFlaggedCount : undefined,
    },
  ];

  const handleSelect = (screen: WorkspaceScreen) => {
    onNavigate(screen);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] w-[260px]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-[#E2E8F0] shrink-0">
        <button
          type="button"
          onClick={() => handleSelect('assessments')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-[#06B6D4] rounded-md"
        >
          <div className="w-8 h-8 rounded-md bg-[#142B4D] text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-[#142B4D] whitespace-nowrap">
            Meridian
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-md text-[#475569] hover:bg-[#F8FAFC] hover:text-[#142B4D]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-[0.05em] uppercase text-[#94A3B8]">
            Administration
          </p>
          <nav className="space-y-1" aria-label="Primary Workspace Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#06B6D4] ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#142B4D]'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#2563EB]' : 'text-[#64748B]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badgeCount !== undefined && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold tabular-nums rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0]">
          <p className="px-3 mb-2 text-xs font-semibold tracking-[0.05em] uppercase text-[#94A3B8]">
            Candidate Experience
          </p>
          <button
            type="button"
            onClick={() => handleSelect('exam-briefing')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#06B6D4] ${
              activeScreen === 'exam-briefing' ||
              activeScreen === 'live-exam' ||
              activeScreen === 'exam-results'
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'text-[#142B4D] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1]'
            }`}
          >
            <PlayCircle className="w-4 h-4 shrink-0 text-[#2563EB]" />
            <span>Live Exam Console</span>
          </button>
        </div>
      </div>

      {/* Institutional Profile Footer */}
      <div className="px-4 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#142B4D] text-white text-xs font-semibold flex items-center justify-center shrink-0">
            DR
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#142B4D] truncate">Dr. Rebecca Thorne</p>
            <p className="text-xs text-[#475569] truncate">Chief Assessment Officer</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed 260px Drawer */}
      <aside className="hidden lg:block w-[260px] shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#142B4D]/40 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
