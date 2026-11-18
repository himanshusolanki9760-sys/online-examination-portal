import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Eye,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Assessment, AssessmentStatus } from '../../types/assessment';
import { StatusBadge, SemanticBadgeVariant } from '../shared/StatusBadge';

interface AssessmentsDashboardProps {
  assessments: Assessment[];
  onCreateAssessment: (assessment: Assessment) => void;
  onLaunchExam: (assessmentId: string) => void;
  onOpenProctor: () => void;
}

const STATUS_TO_BADGE: Record<AssessmentStatus, SemanticBadgeVariant> = {
  'Live Now': 'live',
  Scheduled: 'scheduled',
  Completed: 'completed',
};

export const AssessmentsDashboard: React.FC<AssessmentsDashboardProps> = ({
  assessments,
  onCreateAssessment,
  onLaunchExam,
  onOpenProctor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AssessmentStatus>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('School of Law');
  const [newDuration, setNewDuration] = useState(45);
  const [newPassing, setNewPassing] = useState(70);

  const filtered = useMemo(() => {
    return assessments.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.cohort.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [assessments, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const activeCount = assessments.filter((a) => a.status === 'Live Now').length;
    const totalEnrolled = assessments.reduce((sum, a) => sum + a.enrolledCount, 0);
    const totalCompleted = assessments.reduce((sum, a) => sum + a.completedCount, 0);
    const scoredItems = assessments.filter((a) => a.meanScorePercent !== null);
    const avgScore =
      scoredItems.length > 0
        ? scoredItems.reduce((sum, a) => sum + (a.meanScorePercent ?? 0), 0) / scoredItems.length
        : 0;
    return {
      activeCount,
      totalEnrolled,
      completionRate: totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0,
      avgScore: avgScore.toFixed(1),
    };
  }, [assessments]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;
    const created: Assessment = {
      id: `asm-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      department: newDepartment,
      cohort: 'Winter Cohort 2026',
      status: 'Scheduled',
      durationMinutes: Number(newDuration) || 45,
      passingScorePercent: Number(newPassing) || 70,
      questionCount: 10,
      enrolledCount: 64,
      completedCount: 0,
      meanScorePercent: null,
      scheduledWindow: 'Nov 24, 09:00 – 11:00 PST',
      proctorMode: 'AI + Human Review',
    };
    onCreateAssessment(created);
    setNewTitle('');
    setNewCode('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[32px] sm:leading-10 font-bold tracking-[-0.02em] text-[#142B4D]">
            Assessment Operations
          </h1>
          <p className="text-[15px] text-[#475569] mt-1">
            Monitor live testing windows, cohort completion velocity, and examination readiness.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenProctor}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#142B4D] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4]"
          >
            <Eye className="w-4 h-4 text-[#06B6D4]" />
            <span>Proctor Feed</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4]"
          >
            <Plus className="w-4 h-4" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* 12-Column KPI Summary Strip (Single Elevation, Hairline Divided) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-[#E2E8F0] rounded-xl elevation-low divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
            Active Exam Windows
          </p>
          <p className="font-display text-3xl font-bold text-[#142B4D] tabular-nums mt-2">
            {metrics.activeCount}
          </p>
          <p className="text-[13px] text-[#475569] mt-1">
            {assessments.length} total scheduled cohorts
          </p>
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
            Enrolled Candidates
          </p>
          <p className="font-display text-3xl font-bold text-[#142B4D] tabular-nums mt-2">
            {metrics.totalEnrolled}
          </p>
          <p className="text-[13px] text-[#475569] mt-1">
            Verified identity rosters
          </p>
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
            Submission Rate
          </p>
          <p className="font-display text-3xl font-bold text-[#142B4D] tabular-nums mt-2">
            {metrics.completionRate}%
          </p>
          <p className="text-[13px] text-[#059669] font-medium mt-1">
            On schedule across active hubs
          </p>
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
            Cohort Mean Score
          </p>
          <p className="font-display text-3xl font-bold text-[#142B4D] tabular-nums mt-2">
            {metrics.avgScore}%
          </p>
          <p className="text-[13px] text-[#475569] mt-1">
            Weighted rubric benchmark
          </p>
        </div>
      </div>

      {/* Assessment Directory Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl elevation-low overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 sm:px-6 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg w-fit overflow-x-auto">
            {(['All', 'Live Now', 'Scheduled', 'Completed'] as const).map((tab) => {
              const active = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-[#142B4D] shadow-xs'
                      : 'text-[#475569] hover:text-[#142B4D]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, or cohort..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            />
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                <th className="py-3 px-6 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Assessment
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Status
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Window & Policy
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] text-right">
                  Progress
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] text-right">
                  Mean
                </th>
                <th className="py-3 px-6 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <p className="text-sm font-semibold text-[#142B4D]">
                      No assessments match your filter criteria
                    </p>
                    <p className="text-xs text-[#475569] mt-1">
                      Clear the search query or create a new examination window.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F1F5F9]/50 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <p className="text-sm font-semibold text-[#142B4D]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#475569] mt-0.5">
                        <span className="font-mono font-medium text-[#142B4D]">{item.code}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{item.department}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{item.cohort}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge variant={STATUS_TO_BADGE[item.status]} />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm text-[#0F172A] tabular-nums">{item.scheduledWindow}</p>
                      <p className="text-xs text-[#475569] mt-0.5">
                        {item.durationMinutes} min · {item.proctorMode}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <p className="text-sm font-semibold text-[#142B4D]">
                        {item.completedCount} / {item.enrolledCount}
                      </p>
                      <p className="text-xs text-[#475569]">submitted</p>
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums">
                      {item.meanScorePercent !== null ? (
                        <span className="font-mono text-sm font-semibold text-[#142B4D]">
                          {item.meanScorePercent.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onLaunchExam(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#CBD5E1] text-xs font-semibold text-[#142B4D] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Open Console</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assessment Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142B4D]/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-assessment-title"
        >
          <div className="bg-white border border-[#E2E8F0] rounded-xl w-full max-w-lg elevation-high overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <h2
                id="create-assessment-title"
                className="font-display text-lg font-semibold text-[#142B4D]"
              >
                Schedule New Assessment
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-md text-[#475569] hover:bg-[#F8FAFC] hover:text-[#142B4D]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="LAW-508"
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Department
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option>School of Law</option>
                    <option>Computer Science</option>
                    <option>Medical Sciences</option>
                    <option>Economics & Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                  Assessment Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Evidence & Federal Trial Procedure"
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm tabular-nums text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Passing Threshold (%)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={newPassing}
                    onChange={(e) => setNewPassing(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm tabular-nums text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#142B4D] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-semibold text-white"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
