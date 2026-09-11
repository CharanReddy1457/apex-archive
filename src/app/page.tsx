import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Users, 
  Laptop, 
  Cpu, 
  Zap, 
  Cog, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Layers, 
  Award,
  CheckCircle2
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import prisma from '@/lib/prisma';

// Force dynamic rendering so newly added papers and stats are always fresh
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Determine greeting based on server time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Fetch departments, popular subjects, and recently added papers directly on server
  let departments: any[] = [];
  let popularSubjects: any[] = [];
  let recentPapers: any[] = [];
  let totalPapers = 0;
  let totalSubjects = 0;

  try {
    const [depts, papers, subjects, pCount, sCount] = await Promise.all([
      prisma.department.findMany({
        include: {
          _count: { select: { subjects: true } },
        },
      }),
      prisma.questionPaper.findMany({
        where: { status: 'APPROVED' },
        include: {
          courseOffering: {
            include: {
              subject: { include: { department: true, semester: true } },
              teacher: true,
              academicYear: true,
            },
          },
          paperTags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.subject.findMany({
        include: {
          department: true,
          semester: true,
          courseOfferings: {
            include: {
              questionPapers: { where: { status: 'APPROVED' } },
            },
          },
        },
        take: 6,
      }),
      prisma.questionPaper.count({ where: { status: 'APPROVED' } }),
      prisma.subject.count(),
    ]);

    departments = depts;
    totalPapers = pCount;
    totalSubjects = sCount;

    recentPapers = papers.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      tags: p.paperTags.map((pt) => pt.tag.name),
    }));

    popularSubjects = subjects.map((s) => ({
      ...s,
      papersCount: s.courseOfferings.reduce((sum, co) => sum + co.questionPapers.length, 0),
    })).sort((a, b) => b.papersCount - a.papersCount);
  } catch (err) {
    console.error('Failed to load home page data:', err);
  }

  // Department icon mapping
  const getDeptIcon = (code: string) => {
    switch (code) {
      case 'CSE': return <Laptop className="w-5 h-5 text-cyber-blue" />;
      case 'ECE': return <Cpu className="w-5 h-5 text-cyber-orange" />;
      case 'EEE': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'ME': return <Cog className="w-5 h-5 text-emerald-400" />;
      default: return <BookOpen className="w-5 h-5 text-cyber-blue" />;
    }
  };

  return (
    <div className="space-y-12">
      
      {/* 1. HERO SECTION & PROMINENT SEARCH */}
      <section className="relative pt-6 pb-8 text-center sm:text-left">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-blueSoft border border-cyber-blue/20 text-cyber-blue text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyber-orange" />
            <span>Academic Knowledge Archive • {totalPapers}+ Verified Exam Papers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Previous Papers. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-blue-500 to-cyber-orange">
              Real Course Patterns.
            </span> <br />
            Better Preparation.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-cyber-textMuted max-w-2xl mx-auto leading-relaxed">
            {greeting} 👋 Find previous question papers faster for your subject, professor, academic year, and assessment pattern.
          </p>

          <div className="pt-3">
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* 2. BROWSE BY DEPARTMENT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyber-blue" />
              Browse by Department
            </h2>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
              Explore curriculums, professors, and examinations by engineering branch
            </p>
          </div>
          <Link
            href="/subjects"
            className="text-xs text-cyber-blue hover:underline font-semibold flex items-center gap-1"
          >
            All Curriculums <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={`/search?dept=${dept.code}`}
              className="group p-4 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border/60 hover:border-cyber-blue hover:shadow-cyber-dock-shadow transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-cyber-navy/40 flex items-center justify-center border border-slate-200/60 dark:border-cyber-border/40 group-hover:scale-105 transition-transform">
                  {getDeptIcon(dept.code)}
                </div>
                <span className="font-mono text-xs font-bold text-cyber-blue px-2 py-0.5 rounded bg-cyber-blueSoft">
                  {dept.code}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyber-blue transition-colors line-clamp-1">
                  {dept.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-cyber-textMuted mt-0.5">
                  {dept._count?.subjects || 0} Core Subjects
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. POPULAR SUBJECTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyber-orange" />
              Popular Subjects
            </h2>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
              Most requested courses with syllabi and multi-year question paper banks
            </p>
          </div>
          <Link
            href="/subjects"
            className="text-xs text-cyber-blue hover:underline font-semibold flex items-center gap-1"
          >
            View All ({totalSubjects}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularSubjects.map((sub) => (
            <Link
              key={sub.id}
              href={`/subjects/${sub.code}`}
              className="group p-5 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border/60 hover:border-cyber-blue hover:shadow-cyber-card-dark transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/20">
                    {sub.code}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-cyber-textMuted font-mono">
                    {sub.semester?.label} • {sub.credits} Credits
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyber-blue transition-colors line-clamp-1">
                  {sub.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-cyber-textMuted line-clamp-2 mt-1.5 leading-relaxed">
                  {sub.description || 'Core syllabus and evaluation scheme with previous continuous tests.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-mono text-slate-500 dark:text-cyber-textMuted flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-cyber-orange" />
                  {sub.papersCount} Papers
                </span>
                <span className="text-cyber-blue font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. RECENTLY ADDED QUESTION PAPERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyber-blue" />
              Recently Added Papers
            </h2>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
              Latest Continuous Tests, Midterms, and Final Assessment papers uploaded to the archive
            </p>
          </div>
          <Link
            href="/papers"
            className="text-xs text-cyber-blue hover:underline font-semibold flex items-center gap-1"
          >
            All Papers ({totalPapers}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS FLOW */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 dark:bg-cyber-card/60 border border-slate-200/80 dark:border-cyber-border/40">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            How Apex Archive Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mt-1">
            Zero friction from search to question paper inspection in under 4 clicks
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-cyber-navy/40 border border-slate-200/60 dark:border-cyber-border/30 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyber-blue text-white flex items-center justify-center font-mono font-bold text-sm">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Find Your Subject</h3>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted leading-relaxed">
              Use global search or filter by semester to jump right into your current courses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-cyber-navy/40 border border-slate-200/60 dark:border-cyber-border/30 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyber-blue text-white flex items-center justify-center font-mono font-bold text-sm">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Teacher & Year</h3>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted leading-relaxed">
              Different instructors have different exam styles. Filter exactly for your faculty.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-cyber-navy/40 border border-slate-200/60 dark:border-cyber-border/30 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyber-orange text-white flex items-center justify-center font-mono font-bold text-sm">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Check Pattern</h3>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted leading-relaxed">
              Inspect the visual marks distribution for CT-1, CT-2, Projects, and Final Assessment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-cyber-navy/40 border border-slate-200/60 dark:border-cyber-border/30 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyber-blue text-white flex items-center justify-center font-mono font-bold text-sm">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Open Papers</h3>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted leading-relaxed">
              Preview PDFs directly inside the browser with solution keys and download options.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
