'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, ArrowRight, BookOpen, User, Layers, Info } from 'lucide-react';
import YearComparisonTable from '@/components/YearComparisonTable';
import AssessmentChart from '@/components/AssessmentChart';
import { SubjectDTO, CourseOfferingDTO } from '@/lib/types';

export default function PatternComparePage() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('CS501');
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load all subjects
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  // Load full offerings and assessment patterns for the selected subject
  useEffect(() => {
    async function loadSubjectDetails() {
      if (!selectedSubjectCode) return;
      try {
        const res = await fetch(`/api/subjects/${selectedSubjectCode}`);
        if (res.ok) {
          const data = await res.json();
          setActiveSubject(data.subject);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSubjectDetails();
  }, [selectedSubjectCode]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-blue mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>EVALUATION SCHEME COMPARATOR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Multi-Year Assessment Pattern Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mt-1">
          Compare how continuous tests (CT-1, CT-2), term projects, and final examination weightages vary across academic years and faculty members.
        </p>
      </div>

      {/* Subject Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyber-blue" />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Select Course to Compare:
          </span>
        </div>

        <select
          value={selectedSubjectCode}
          onChange={(e) => setSelectedSubjectCode(e.target.value)}
          className="text-xs sm:text-sm font-semibold py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white focus:ring-2 focus:ring-cyber-blue"
        >
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.code}>
              {sub.code} — {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Comparison Matrix */}
      {activeSubject && activeSubject.courseOfferings && (
        <div className="space-y-8">
          <YearComparisonTable
            subjectName={activeSubject.name}
            offerings={activeSubject.courseOfferings}
          />

          {/* Individual Breakdown Cards */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Individual Faculty & Academic Year Schemes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSubject.courseOfferings.map((off: CourseOfferingDTO) => (
                <AssessmentChart
                  key={off.id}
                  pattern={off.assessmentPattern}
                  title={`${off.academicYear?.label} Scheme`}
                  subtitle={`Taught by ${off.teacher?.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rationale Notice */}
      <div className="p-5 rounded-2xl bg-cyber-blueSoft border border-cyber-blue/20 text-xs text-slate-600 dark:text-cyber-textMuted space-y-1">
        <h4 className="font-bold text-cyber-blue flex items-center gap-2">
          <Info className="w-4 h-4" /> Why do assessment patterns vary?
        </h4>
        <p leading-relaxed>
          Academic boards grant professors autonomy to distribute internal assessment marks based on course pedagogical objectives. For instance, Dr. Ravi Kumar may allocate 20 marks to a hands-on relational database project, while Dr. Anil Sharma emphasizes rigorous SQL homework assignments.
        </p>
      </div>

    </div>
  );
}
