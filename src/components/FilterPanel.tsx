'use client';

import React from 'react';
import { Filter, X, RefreshCw, Check } from 'lucide-react';
import { DepartmentDTO, SemesterDTO, TeacherDTO } from '@/lib/types';

interface FilterPanelProps {
  departments: DepartmentDTO[];
  semesters: SemesterDTO[];
  teachers: TeacherDTO[];
  selectedDept: string;
  selectedSem: string;
  selectedTeacher: string;
  selectedYear: string;
  selectedAssessment: string;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function FilterPanel({
  departments,
  semesters,
  teachers,
  selectedDept,
  selectedSem,
  selectedTeacher,
  selectedYear,
  selectedAssessment,
  onFilterChange,
  onReset,
  isMobileOpen = false,
  onCloseMobile,
}: FilterPanelProps) {
  const assessmentOptions = [
    'All',
    'CT-1',
    'CT-2',
    'Final Assessment',
    'Midterm',
    'Assignment',
    'Quiz',
    'Model Paper',
  ];

  const yearOptions = ['All', '2025-26', '2024-25', '2023-24'];

  const hasActiveFilters = 
    (selectedDept && selectedDept !== 'All') ||
    (selectedSem && selectedSem !== 'All') ||
    (selectedTeacher && selectedTeacher !== 'All') ||
    (selectedYear && selectedYear !== 'All') ||
    (selectedAssessment && selectedAssessment !== 'All');

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyber-blue" />
          Filter Repository
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-cyber-orange hover:underline flex items-center gap-1 font-mono"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Department Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-2">
          Department
        </label>
        <select
          value={selectedDept}
          onChange={(e) => onFilterChange('dept', e.target.value)}
          className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border focus:ring-2 focus:ring-cyber-blue focus:outline-none text-slate-900 dark:text-white"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.code}>
              {d.code} — {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Semester Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-2">
          Semester
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => onFilterChange('sem', 'All')}
            className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
              !selectedSem || selectedSem === 'All'
                ? 'bg-cyber-blue text-white border-cyber-blue font-bold'
                : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onFilterChange('sem', s.toString())}
              className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                selectedSem === s.toString()
                  ? 'bg-cyber-blue text-white border-cyber-blue font-bold'
                  : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
              }`}
            >
              Sem {s}
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-2">
          Faculty / Professor
        </label>
        <select
          value={selectedTeacher}
          onChange={(e) => onFilterChange('teacher', e.target.value)}
          className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border focus:ring-2 focus:ring-cyber-blue focus:outline-none text-slate-900 dark:text-white"
        >
          <option value="All">All Professors</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.title})
            </option>
          ))}
        </select>
      </div>

      {/* Academic Year Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-2">
          Academic Year
        </label>
        <div className="flex flex-wrap gap-1.5">
          {yearOptions.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => onFilterChange('year', yr)}
              className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                (selectedYear === yr) || (!selectedYear && yr === 'All')
                  ? 'bg-cyber-blue text-white border-cyber-blue font-semibold'
                  : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Type Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-2">
          Assessment Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {assessmentOptions.map((ast) => (
            <button
              key={ast}
              type="button"
              onClick={() => onFilterChange('assessment', ast)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                (selectedAssessment === ast) || (!selectedAssessment && ast === 'All')
                  ? 'bg-cyber-blueSoft text-cyber-blue border-cyber-blue font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
              }`}
            >
              {ast}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block w-72 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border p-5 shadow-sm h-fit sticky top-20">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-cyber-card border-l border-slate-200 dark:border-cyber-border p-5 shadow-2xl overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
