import React, { useMemo, useState } from 'react';
import { CheckCircle2, Download, FileSearch, Search, ShieldAlert, X } from 'lucide-react';
import { CandidateLedgerEntry, IntegrityStatus } from '../../types/assessment';
import { StatusBadge } from '../shared/StatusBadge';

interface CandidateLedgerScreenProps {
  entries: CandidateLedgerEntry[];
  onUpdateIntegrity: (entryId: string, status: IntegrityStatus, note?: string) => void;
}

export const CandidateLedgerScreen: React.FC<CandidateLedgerScreenProps> = ({
  entries,
  onUpdateIntegrity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'passed' | 'failed' | 'flagged'>('all');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [auditNoteInput, setAuditNoteInput] = useState('');

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedEntryId) ?? null,
    [entries, selectedEntryId]
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesMode =
        filterMode === 'all' ||
        (filterMode === 'passed' && entry.resultStatus === 'Passed') ||
        (filterMode === 'failed' && entry.resultStatus === 'Failed') ||
        (filterMode === 'flagged' && entry.integrityStatus === 'Flagged');
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        entry.candidateName.toLowerCase().includes(q) ||
        entry.candidateId.toLowerCase().includes(q) ||
        entry.assessmentTitle.toLowerCase().includes(q);
      return matchesMode && matchesSearch;
    });
  }, [entries, filterMode, searchQuery]);

  const handleOpenAudit = (entry: CandidateLedgerEntry) => {
    setSelectedEntryId(entry.id);
    setAuditNoteInput(entry.proctorNotes);
  };

  const handleExportCsv = () => {
    const header = [
      'Candidate ID',
      'Candidate Name',
      'Assessment',
      'Submitted At',
      'Duration (min)',
      'Score (%)',
      'Result',
      'Integrity',
    ].join(',');
    const rows = filteredEntries.map((e) =>
      [
        e.candidateId,
        `"${e.candidateName}"`,
        `"${e.assessmentTitle}"`,
        `"${e.submittedAt}"`,
        e.durationUsedMinutes,
        e.scorePercent,
        e.resultStatus,
        e.integrityStatus,
      ].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meridian-candidate-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[32px] sm:leading-10 font-bold tracking-[-0.02em] text-[#142B4D]">
            Candidate Results & Audit Ledger
          </h1>
          <p className="text-[15px] text-[#475569] mt-1">
            Official score certifications, timing telemetry, and post-exam integrity reviews.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#142B4D] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4 text-[#475569]" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl elevation-low overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:px-6 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg w-fit overflow-x-auto">
            {[
              { id: 'all', label: 'All Submissions' },
              { id: 'passed', label: 'Passed' },
              { id: 'failed', label: 'Failed' },
              { id: 'flagged', label: 'Integrity Flagged' },
            ].map((tab) => {
              const active = filterMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id as typeof filterMode)}
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

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate or ID..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Structured Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                <th className="py-3 px-6 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Candidate
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Assessment
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] text-right">
                  Duration
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] text-right">
                  Score
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Determination
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                  Integrity
                </th>
                <th className="py-3 px-6 text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] text-right">
                  Audit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#F1F5F9]/50 transition-colors">
                  <td className="py-3.5 px-6">
                    <p className="text-sm font-semibold text-[#142B4D]">{entry.candidateName}</p>
                    <p className="text-xs text-[#475569] font-mono mt-0.5">{entry.candidateId}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-sm text-[#0F172A] max-w-xs truncate">
                      {entry.assessmentTitle}
                    </p>
                    <p className="text-xs text-[#475569] mt-0.5 tabular-nums">{entry.submittedAt}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm tabular-nums text-[#475569]">
                    {entry.durationUsedMinutes} min
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    <span className="text-sm font-bold text-[#142B4D]">{entry.scorePercent}%</span>
                    <span className="block text-xs text-[#475569]">
                      {entry.pointsEarned}/{entry.pointsTotal} pts
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      variant={entry.resultStatus === 'Passed' ? 'passed' : 'failed'}
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      variant={
                        entry.integrityStatus === 'Verified'
                          ? 'verified'
                          : entry.integrityStatus === 'Flagged'
                            ? 'flagged'
                            : 'nominal'
                      }
                    />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenAudit(entry)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#CBD5E1] text-xs font-semibold text-[#142B4D] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Audit Inspection Drawer */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#142B4D]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-drawer-title"
        >
          <div className="bg-white w-full max-w-md h-full border-l border-[#E2E8F0] elevation-high flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div>
                <h2 id="audit-drawer-title" className="font-display text-lg font-semibold text-[#142B4D]">
                  Session Audit Record
                </h2>
                <p className="text-xs font-mono text-[#475569] mt-0.5">
                  {selectedEntry.candidateId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntryId(null)}
                className="p-1.5 rounded-md text-[#475569] hover:bg-[#F8FAFC]"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <p className="text-lg font-semibold text-[#142B4D]">
                  {selectedEntry.candidateName}
                </p>
                <p className="text-sm text-[#475569] mt-0.5">{selectedEntry.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge
                    variant={selectedEntry.resultStatus === 'Passed' ? 'passed' : 'failed'}
                  />
                  <StatusBadge
                    variant={
                      selectedEntry.integrityStatus === 'Verified'
                        ? 'verified'
                        : selectedEntry.integrityStatus === 'Flagged'
                          ? 'flagged'
                          : 'nominal'
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#E2E8F0]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                    Final Score
                  </p>
                  <p className="font-mono text-xl font-bold text-[#142B4D] tabular-nums mt-1">
                    {selectedEntry.scorePercent}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                    Flagged Events
                  </p>
                  <p className="font-mono text-xl font-bold text-[#142B4D] tabular-nums mt-1">
                    {selectedEntry.flaggedEventsCount}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-[#475569] mb-2">
                  Invigilator Notes
                </label>
                <textarea
                  rows={4}
                  value={auditNoteInput}
                  onChange={(e) => setAuditNoteInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateIntegrity(selectedEntry.id, 'Flagged', auditNoteInput);
                  setSelectedEntryId(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#B45309] hover:bg-[#FFFBEB]"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Escalate Flag</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateIntegrity(selectedEntry.id, 'Verified', auditNoteInput);
                  setSelectedEntryId(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-semibold text-white"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
