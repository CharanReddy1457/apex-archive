'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  BookOpen, 
  FileText, 
  FolderTree, 
  Eye, 
  Download, 
  Calendar, 
  Award,
  ChevronRight
} from 'lucide-react';
import PaperViewerModal from '@/components/PaperViewerModal';
import EmptyState from '@/components/EmptyState';
import { TeacherDTO, CourseOfferingDTO, QuestionPaperDTO } from '@/lib/types';

export default function TeacherProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeViewerPaper, setActiveViewerPaper] = useState<QuestionPaperDTO | null>(null);

  useEffect(() => {
    async function loadTeacher() {
      try {
        const res = await fetch(`/api/teachers/${id}`);
        if (!res.ok) {
          setError('Faculty member not found');
          return;
        }
        const data = await res.json();
        setTeacher(data.teacher);
      } catch (err: any) {
        setError(err.message || 'Error loading faculty profile');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadTeacher();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <EmptyState
        title="Faculty Member Not Found"
        description="We couldn't locate academic records for this teacher ID."
        actionText="Back to Faculty Directory"
        actionHref="/teachers"
      />
    );
  }

  // Group offerings by subject
  const subjectsMap = new Map<string, { subject: any; offerings: any[] }>();
  (teacher.courseOfferings || []).forEach((off: any) => {
    if (!subjectsMap.has(off.subjectId)) {
      subjectsMap.set(off.subjectId, {
        subject: off.subject,
        offerings: [],
      });
    }
    subjectsMap.get(off.subjectId)!.offerings.push(off);
  });
  const subjectGroups = Array.from(subjectsMap.values());

  return (
    <div className="space-y-8">
      
      {/* Back Link */}
      <Link
        href="/teachers"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-cyber-textMuted hover:text-cyber-blue transition-colors font-mono"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Directory
      </Link>

      {/* Profile Academic Header */}
      <div className="rounded-3xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {teacher.avatar ? (
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyber-blue/40 flex-shrink-0 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/40 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              {teacher.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
          )}

          <div className="space-y-2 flex-1">
            <div>
              <span className="text-xs font-mono font-bold text-cyber-blue uppercase tracking-wider block mb-1">
                {teacher.department?.name || 'Academic Faculty'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {teacher.name}
              </h1>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {teacher.title}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-cyber-textMuted pt-1">
              {teacher.email && (
                <a
                  href={`mailto:${teacher.email}`}
                  className="flex items-center gap-1.5 hover:text-cyber-blue transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyber-blue" />
                  <span>{teacher.email}</span>
                </a>
              )}
              {teacher.cabin && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyber-orange" />
                  <span>{teacher.cabin}</span>
                </div>
              )}
            </div>

            {teacher.bio && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-cyber-textMuted leading-relaxed pt-2">
                {teacher.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subjects Taken */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyber-blue" />
          Subjects Taken
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {subjectGroups.map(({ subject }) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.code}`}
              className="p-4 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border hover:border-cyber-blue transition-all group flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-cyber-blue">
                  {subject.code}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyber-blue transition-colors line-clamp-1">
                  {subject.name}
                </h4>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* Previous Papers Hierarchy Tree */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-cyber-orange" />
            Previous Papers Archive Hierarchy
          </h2>
          <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
            Examinations conducted by {teacher.name} structured by course and academic year
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border p-6 font-mono text-xs sm:text-sm space-y-6">
          {subjectGroups.map(({ subject, offerings }) => (
            <div key={subject.id} className="space-y-3">
              {/* Subject node */}
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <span className="text-cyber-blue">📁</span>
                <Link href={`/subjects/${subject.code}`} className="hover:underline hover:text-cyber-blue">
                  {subject.name} ({subject.code})
                </Link>
              </div>

              {/* Offerings by academic year */}
              <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 ml-2">
                {offerings.map((off: any) => (
                  <div key={off.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span className="text-cyber-orange">└──</span>
                      <span>AY {off.academicYear?.label}</span>
                      {off.assessmentPattern && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({off.assessmentPattern.components?.map((c: any) => `${c.name}: ${c.maxMarks}M`).join(', ')})
                        </span>
                      )}
                    </div>

                    {/* Papers inside this offering */}
                    <div className="pl-6 space-y-2">
                      {(!off.questionPapers || off.questionPapers.length === 0) ? (
                        <p className="text-slate-400 text-xs italic">
                          No papers stored yet for this academic year.
                        </p>
                      ) : (
                        off.questionPapers.map((paper: any) => (
                          <div
                            key={paper.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-cyber-navy/40 border border-slate-200/60 dark:border-cyber-border/30 hover:border-cyber-blue transition-all"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="px-2 py-0.5 rounded bg-cyber-blueSoft text-cyber-blue font-bold text-[11px]">
                                {paper.assessmentType}
                              </span>
                              <span className="text-slate-800 dark:text-slate-200 font-sans truncate font-medium">
                                {paper.title}
                              </span>
                              <span className="text-slate-400 text-[11px] hidden sm:inline">
                                ({paper.maxMarks}M • {paper.durationMinutes}m)
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setActiveViewerPaper({
                                  ...paper,
                                  courseOffering: {
                                    id: off.id,
                                    subject,
                                    teacher,
                                    academicYear: off.academicYear,
                                  },
                                })}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyber-blue text-white font-sans text-xs font-semibold hover:bg-blue-600 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>

                              <a
                                href={paper.fileUrl}
                                download={paper.fileName}
                                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                title="Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal PDF Viewer */}
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
