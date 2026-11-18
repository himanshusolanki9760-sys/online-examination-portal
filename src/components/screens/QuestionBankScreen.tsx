import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Search, X } from 'lucide-react';
import { Assessment, ExamQuestion } from '../../types/assessment';

interface QuestionBankScreenProps {
  questions: ExamQuestion[];
  assessments: Assessment[];
  onAddQuestion: (question: ExamQuestion) => void;
}

export const QuestionBankScreen: React.FC<QuestionBankScreenProps> = ({
  questions,
  assessments,
  onAddQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id ?? null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formAssessmentId, setFormAssessmentId] = useState(assessments[0]?.id ?? 'asm-const-law');
  const [formSection, setFormSection] = useState('Section I · Constitutional Doctrine');
  const [formDifficulty, setFormDifficulty] = useState<ExamQuestion['difficulty']>('Intermediate');
  const [formPoints, setFormPoints] = useState(2);
  const [formStem, setFormStem] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'a' | 'b' | 'c' | 'd'>('b');
  const [formRationale, setFormRationale] = useState('');

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesAsm = selectedAssessmentId === 'all' || q.assessmentId === selectedAssessmentId;
      const needle = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        q.stem.toLowerCase().includes(needle) ||
        q.code.toLowerCase().includes(needle) ||
        q.section.toLowerCase().includes(needle);
      return matchesAsm && matchesSearch;
    });
  }, [questions, searchQuery, selectedAssessmentId]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStem.trim() || !optA.trim() || !optB.trim()) return;
    const newItem: ExamQuestion = {
      id: `q-${Date.now()}`,
      code: `ITEM-${questions.length + 1}`,
      assessmentId: formAssessmentId,
      section: formSection.trim() || 'Section I · General',
      difficulty: formDifficulty,
      points: Number(formPoints) || 2,
      stem: formStem.trim(),
      options: [
        { id: 'a', label: 'A', text: optA.trim() },
        { id: 'b', label: 'B', text: optB.trim() },
        { id: 'c', label: 'C', text: optC.trim() || 'None of the above options apply.' },
        { id: 'd', label: 'D', text: optD.trim() || 'Insufficient jurisdictional basis.' },
      ],
      correctOptionId: correctOpt,
      rationale:
        formRationale.trim() ||
        'Verified against institutional rubric and primary statutory precedent.',
    };
    onAddQuestion(newItem);
    setExpandedId(newItem.id);
    setFormStem('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setFormRationale('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[32px] sm:leading-10 font-bold tracking-[-0.02em] text-[#142B4D]">
            Question Bank & Rubrics
          </h1>
          <p className="text-[15px] text-[#475569] mt-1">
            Curate calibrated examination items, point weights, and verified grading rationales.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Author Question</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:px-6 elevation-low flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="bank-filter" className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
            Exam Track
          </label>
          <select
            id="bank-filter"
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-sm font-medium text-[#142B4D] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Assessments ({questions.length} items)</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stems, codes, or sections..."
            className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Structured Question List */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl elevation-low divide-y divide-[#E2E8F0] overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <p className="text-sm font-semibold text-[#142B4D]">No question items found</p>
            <p className="text-xs text-[#475569] mt-1">
              Adjust your search filter or author a new item for this assessment track.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const parentAsm = assessments.find((a) => a.id === q.assessmentId);
            return (
              <div key={q.id} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full text-left px-6 py-4 flex items-start justify-between gap-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-[#475569] mb-1">
                      <span className="font-mono font-semibold text-[#142B4D]">{q.code}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{parentAsm?.code ?? 'EXAM'}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{q.section}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{q.difficulty}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums font-medium text-[#142B4D]">
                        {q.points} pts
                      </span>
                    </p>
                    <p className="text-[15px] font-medium text-[#0F172A] line-clamp-2 leading-6">
                      {q.stem}
                    </p>
                  </div>
                  <span className="p-1.5 rounded-md text-[#475569] shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt) => {
                        const isCorrect = opt.id === q.correctOptionId;
                        return (
                          <div
                            key={opt.id}
                            className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 ${
                              isCorrect
                                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#0F172A]'
                                : 'bg-white border-[#E2E8F0] text-[#475569]'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? 'bg-[#059669] text-white'
                                  : 'bg-[#F1F5F9] text-[#475569]'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="leading-5">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#475569]">
                        Grading Rationale
                      </p>
                      <p className="text-sm text-[#0F172A] leading-6 mt-1">{q.rationale}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Question Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142B4D]/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="author-question-title"
        >
          <div className="bg-white border border-[#E2E8F0] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto elevation-high">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white">
              <h2 id="author-question-title" className="font-display text-lg font-semibold text-[#142B4D]">
                Author Examination Item
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-md text-[#475569] hover:bg-[#F8FAFC]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Target Assessment
                  </label>
                  <select
                    value={formAssessmentId}
                    onChange={(e) => setFormAssessmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm tabular-nums text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Section Header
                  </label>
                  <input
                    type="text"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Difficulty Calibration
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) =>
                      setFormDifficulty(e.target.value as ExamQuestion['difficulty'])
                    }
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Foundational">Foundational</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                  Question Stem
                </label>
                <textarea
                  required
                  rows={3}
                  value={formStem}
                  onChange={(e) => setFormStem(e.target.value)}
                  placeholder="Enter the complete scenario or analytical question prompt..."
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1">
                    Option A
                  </label>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1">
                    Option B
                  </label>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1">
                    Option C
                  </label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1">
                    Option D
                  </label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Correct Option
                  </label>
                  <select
                    value={correctOpt}
                    onChange={(e) => setCorrectOpt(e.target.value as 'a' | 'b' | 'c' | 'd')}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#142B4D] mb-1.5">
                    Grading Rationale
                  </label>
                  <input
                    type="text"
                    value={formRationale}
                    onChange={(e) => setFormRationale(e.target.value)}
                    placeholder="Explain why the keyed option is authoritative..."
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-md bg-white border border-[#CBD5E1] text-sm font-semibold text-[#142B4D] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-semibold text-white"
                >
                  Save to Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
