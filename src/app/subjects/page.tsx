import React from 'react';
import Link from 'next/link';
import { BookOpen, Layers, Filter } from 'lucide-react';
import SubjectCard from '@/components/SubjectCard';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: { dept?: string; sem?: string };
}) {
  const selectedDept = searchParams.dept || 'All';
  const selectedSem = searchParams.sem || 'All';

  const where: any = {};
  if (selectedDept && selectedDept !== 'All') {
    where.department = { code: selectedDept };
  }
  if (selectedSem && selectedSem !== 'All') {
    const semNum = parseInt(selectedSem, 10);
    if (!isNaN(semNum)) {
      where.semester = { number: semNum };
    }
  }

  const [subjects, departments] = await Promise.all([
    prisma.subject.findMany({
      where,
      include: {
        department: true,
        semester: true,
        courseOfferings: {
          include: {
            questionPapers: { where: { status: 'APPROVED' }, select: { id: true } },
            teacher: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    }),
    prisma.department.findMany({ orderBy: { code: 'asc' } }),
  ]);

  const formattedSubjects = subjects.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    departmentId: s.departmentId,
    semesterId: s.semesterId,
    credits: s.credits,
    description: s.description,
    coordinator: s.coordinator,
    department: s.department,
    semester: s.semester,
    papersCount: s.courseOfferings.reduce((sum, co) => sum + co.questionPapers.length, 0),
    teachersCount: new Set(s.courseOfferings.map((co) => co.teacherId)).size,
  }));

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-blue mb-1">
          <BookOpen className="w-4 h-4" />
          <span>CURRICULUM DIRECTORY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Academic Subjects & Courses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mt-1">
          Browse comprehensive university subjects, full syllabi, module breakdowns, and previous paper repositories.
        </p>
      </div>

      {/* Filter Tabs (Department & Semester) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border">
        
        {/* Department Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase mr-2 font-mono">Dept:</span>
          <Link
            href={`/subjects?${new URLSearchParams({ ...(selectedSem !== 'All' ? { sem: selectedSem } : {}) }).toString()}`}
            className={`px-3 py-1 text-xs rounded-xl font-mono border transition-all ${
              selectedDept === 'All'
                ? 'bg-cyber-blue text-white border-cyber-blue font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
            }`}
          >
            All
          </Link>
          {departments.map((d) => (
            <Link
              key={d.id}
              href={`/subjects?${new URLSearchParams({ dept: d.code, ...(selectedSem !== 'All' ? { sem: selectedSem } : {}) }).toString()}`}
              className={`px-3 py-1 text-xs rounded-xl font-mono border transition-all ${
                selectedDept === d.code
                  ? 'bg-cyber-blue text-white border-cyber-blue font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
              }`}
            >
              {d.code}
            </Link>
          ))}
        </div>

        {/* Semester selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase mr-2 font-mono">Sem:</span>
          <Link
            href={`/subjects?${new URLSearchParams({ ...(selectedDept !== 'All' ? { dept: selectedDept } : {}) }).toString()}`}
            className={`px-2.5 py-1 text-xs rounded-xl font-mono border transition-all ${
              selectedSem === 'All'
                ? 'bg-cyber-blue text-white border-cyber-blue font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
            }`}
          >
            All
          </Link>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <Link
              key={s}
              href={`/subjects?${new URLSearchParams({ ...(selectedDept !== 'All' ? { dept: selectedDept } : {}), sem: s.toString() }).toString()}`}
              className={`px-2.5 py-1 text-xs rounded-xl font-mono border transition-all ${
                selectedSem === s.toString()
                  ? 'bg-cyber-blue text-white border-cyber-blue font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-cyber-navy/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue'
              }`}
            >
              S{s}
            </Link>
          ))}
        </div>

      </div>

      {/* Subject Cards Grid */}
      {formattedSubjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-cyber-card border border-dashed border-slate-200 dark:border-cyber-border">
          <p className="text-slate-500 dark:text-cyber-textMuted text-sm">
            No subjects found for the selected department and semester.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {formattedSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}

    </div>
  );
}
