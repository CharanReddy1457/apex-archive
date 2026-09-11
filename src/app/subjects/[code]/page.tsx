'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Award, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  Layers, 
  Download, 
  Eye, 
  BarChart2, 
  ListOrdered, 
  Info,
  Clock,
  Sparkles,
  Bookmark
} from 'lucide-react';
import AssessmentChart from '@/components/AssessmentChart';
import YearComparisonTable from '@/components/YearComparisonTable';
import PaperViewerModal from '@/components/PaperViewerModal';
import { PaperCardSkeleton } from '@/components/SkeletonLoaders';
import EmptyState from '@/components/EmptyState';
import { SubjectDTO, CourseOfferingDTO, QuestionPaperDTO, SyllabusUnit } from '@/lib/types';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = (params?.code as string)?.toUpperCase();

  const [subject, setSubject] = useState<SubjectDTO | null>(null);
  const [offerings, setOfferings] = useState<CourseOfferingDTO[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'pattern' | 'papers' | 'compare'>('papers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected paper for modal preview
  const [activeViewerPaper, setActiveViewerPaper] = useState<QuestionPaperDTO | null>(null);

  useEffect(() => {
    async function loadSubject() {
      setLoading(true);
      try {
        const res = await fetch(`/api/subjects/${code}`);
        if (!res.ok) {
          setError('Subject not found');
          return;
        }
        const data = await res.json();
        const sub = data.subject;
        setSubject(sub);
        setOfferings(sub.courseOfferings || []);

        // Default selection: pick first offering or match searchParams
        if (sub.courseOfferings && sub.courseOfferings.length > 0) {
          const first = sub.courseOfferings[0];
          setSelectedTeacherId(first.teacherId);
          setSelectedYearId(first.academicYearId);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading subject');
      } finally {
        setLoading(false);
      }
    }

    if (code) loadSubject();
  }, [code]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-36 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PaperCardSkeleton />
          <PaperCardSkeleton />
          <PaperCardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <EmptyState
        title="Subject Not Found"
        description={`We couldn't locate any academic records for course code ${code}.`}
        actionText="Back to Subjects Directory"
        actionHref="/subjects"
      />
    );
  }

  // Get list of unique teachers for this subject
  const availableTeachersMap = new Map<string, any>();
  offerings.forEach((o) => {
    if (o.teacher) availableTeachersMap.set(o.teacher.id, o.teacher);
  });
  const availableTeachers = Array.from(availableTeachersMap.values());

  // Filter available years for currently selected teacher
  const offeringsForTeacher = offerings.filter((o) => o.teacherId === selectedTeacherId);
  const availableYears = offeringsForTeacher.map((o) => o.academicYear).filter(Boolean);

  // Active offering matching currently selected teacher and year
  const activeOffering = offerings.find(
    (o) => o.teacherId === selectedTeacherId && o.academicYearId === selectedYearId
  ) || offeringsForTeacher[0] || offerings[0];

  // Syllabus units parsed
  const syllabusUnits: SyllabusUnit[] = Array.isArray(subject.syllabusUnits)
    ? subject.syllabusUnits
    : [];

  // Group papers by academic year for this subject
  const papersByYear: Record<string, QuestionPaperDTO[]> = {};
  offerings.forEach((off) => {
    const yr = off.academicYear?.label || 'General';
    if (!papersByYear[yr]) papersByYear[yr] = [];
    if (off.questionPapers) {
      off.questionPapers.forEach((qp) => {
        papersByYear[yr].push({
          ...qp,
          courseOffering: {
            id: off.id,
            subject: subject,
            teacher: off.teacher!,
            academicYear: off.academicYear!,
          },
        });
      });
    }
  });

  return (
    <div className="space-y-8">
      
      {/* Breadcrumb Back Link */}
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-cyber-textMuted hover:text-cyber-blue transition-colors font-mono"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Subjects
      </Link>

      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/30 shadow-sm">
                {subject.code}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-cyber-navy/50 text-slate-600 dark:text-slate-300">
                {subject.department?.name}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-cyber-navy/50 text-slate-600 dark:text-slate-300">
                {subject.semester?.label} • {subject.credits} Credits
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {subject.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-cyber-textMuted leading-relaxed">
              {subject.description || 'Comprehensive course repository covering syllabus, assessment schemes, and previous exams.'}
            </p>

            {subject.coordinator && (
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
                <User className="w-4 h-4 text-cyber-blue" />
                <span>Course Coordinator: <strong className="font-semibold">{subject.coordinator}</strong></span>
              </div>
            )}
          </div>

          {/* Teacher & Academic Year Selector Widget */}
          <div className="rounded-2xl p-4 bg-slate-50 dark:bg-cyber-navy/40 border border-slate-200 dark:border-cyber-border/60 space-y-3 min-w-[280px]">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono block">
              Active Evaluation Scheme
            </span>

            {/* Teacher Select */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Instructor / Professor:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => {
                  setSelectedTeacherId(e.target.value);
                  const matchingOfferings = offerings.filter((o) => o.teacherId === e.target.value);
                  if (matchingOfferings.length > 0) {
                    setSelectedYearId(matchingOfferings[0].academicYearId);
                  }
                }}
                className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border focus:ring-2 focus:ring-cyber-blue text-slate-900 dark:text-white"
              >
                {availableTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Academic Year:
              </label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full text-xs font-mono font-semibold py-2 px-3 rounded-xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border focus:ring-2 focus:ring-cyber-blue text-slate-900 dark:text-white"
              >
                {availableYears.map((yr: any) => (
                  <option key={yr.id} value={yr.id}>
                    AY {yr.label} {yr.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'papers', label: 'Previous Papers', icon: FileText },
            { id: 'pattern', label: 'Assessment Pattern', icon: Award },
            { id: 'syllabus', label: 'Full Syllabus', icon: ListOrdered },
            { id: 'compare', label: 'Year Comparison', icon: BarChart2 },
            { id: 'overview', label: 'Course Overview', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyber-blue text-white shadow-sm shadow-cyber-glow-blue'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PREVIOUS QUESTION PAPERS */}
      {activeTab === 'papers' && (
        <div className="space-y-8">
          
          {/* Active Teacher + Year Filtered Papers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyber-orange" />
                  Papers for {activeOffering?.teacher?.name} (AY {activeOffering?.academicYear?.label})
                </h2>
                <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
                  Matching your selected instructor and evaluation scheme
                </p>
              </div>

              <Link
                href={`/admin?subjectId=${subject.id}`}
                className="text-xs text-cyber-blue hover:underline font-semibold"
              >
                + Upload Paper
              </Link>
            </div>

            {(!activeOffering?.questionPapers || activeOffering.questionPapers.length === 0) ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-cyber-card border border-dashed border-slate-200 dark:border-cyber-border">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mb-2">
                  No question paper uploaded yet for this teacher and academic year.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-cyber-blue font-semibold hover:underline"
                >
                  Have a copy? Upload to help juniors
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOffering.questionPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border/80 shadow-sm hover:border-cyber-blue transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyber-blueSoft text-cyber-blue">
                          {paper.assessmentType}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paper Available
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">
                        {paper.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-cyber-textMuted font-mono py-1.5 mb-3 border-t border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">
                          {paper.maxMarks} Marks
                        </span>
                        <span>•</span>
                        <span>{paper.durationMinutes} Mins</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveViewerPaper({
                          ...paper,
                          courseOffering: {
                            id: activeOffering.id,
                            subject,
                            teacher: activeOffering.teacher!,
                            academicYear: activeOffering.academicYear!,
                          },
                        })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Paper</span>
                      </button>

                      <a
                        href={paper.fileUrl}
                        download={paper.fileName}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Previous Papers Grouped by Academic Year */}
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Archive Across All Academic Years
            </h3>

            {Object.entries(papersByYear).map(([yearLabel, yearPapers]) => (
              <div key={yearLabel} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-cyber-navy/60 text-slate-700 dark:text-slate-300">
                    AY {yearLabel}
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {yearPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 rounded-xl bg-white dark:bg-cyber-card border border-slate-200/80 dark:border-cyber-border/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="overflow-hidden">
                        <span className="font-bold text-cyber-blue block font-mono">
                          {paper.assessmentType}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 truncate block">
                          {paper.courseOffering?.teacher?.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {paper.maxMarks} M • {paper.durationMinutes} Min
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveViewerPaper(paper)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyber-blue text-white font-semibold text-xs"
                        >
                          View
                        </button>
                        <a
                          href={paper.fileUrl}
                          download={paper.fileName}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-white"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: ASSESSMENT PATTERN BREAKDOWN */}
      {activeTab === 'pattern' && (
        <div className="space-y-6">
          <AssessmentChart
            pattern={activeOffering?.assessmentPattern}
            title={`${subject.name} Assessment Breakdown`}
            subtitle={`Scheme for ${activeOffering?.teacher?.name} • Academic Year ${activeOffering?.academicYear?.label}`}
          />

          <div className="p-5 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-xs text-slate-600 dark:text-cyber-textMuted space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyber-blue" />
              Dynamic Assessment Pattern Architecture
            </h4>
            <p leading-relaxed>
              Assessment patterns in Apex Archive are dynamically configured per professor and academic year. If your class scheme differs, administrators and teaching assistants can adjust the weightage breakdown directly in the Admin Portal.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: FULL SYLLABUS */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-cyber-blue" />
              Course Syllabus & Module Breakdown
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-cyber-textMuted">
              {syllabusUnits.length} Structured Units
            </span>
          </div>

          <div className="space-y-4">
            {syllabusUnits.map((unit) => (
              <div
                key={unit.unitNumber}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-cyber-blueSoft text-cyber-blue font-mono font-bold text-xs flex items-center justify-center border border-cyber-blue/20">
                    U{unit.unitNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Unit {unit.unitNumber} — {unit.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-cyber-textMuted leading-relaxed pl-11">
                  {unit.description}
                </p>

                {unit.topics && unit.topics.length > 0 && (
                  <div className="pl-11 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase font-mono block mb-1.5">
                      Key Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {unit.topics.map((top) => (
                        <span
                          key={top}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-cyber-navy/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-cyber-border/30"
                        >
                          {top}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: YEAR COMPARISON */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <YearComparisonTable
            subjectName={subject.name}
            offerings={offerings}
          />
        </div>
      )}

      {/* TAB 5: COURSE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Course Overview & Academic Guidelines
          </h2>
          <p className="text-sm text-slate-600 dark:text-cyber-textMuted leading-relaxed">
            {subject.description}
          </p>
          {subject.fullSyllabus && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Detailed Scope
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {subject.fullSyllabus}
              </p>
            </div>
          )}
        </div>
      )}

      {/* In-Browser PDF Viewer Modal */}
      {activeViewerPaper && (
        <PaperViewerModal
          paper={activeViewerPaper}
          isOpen={!!activeViewerPaper}
          onClose={() => setActiveViewerPaper(null)}
        />
      )}

    </div>
  );
}
