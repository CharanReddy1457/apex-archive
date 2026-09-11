import React from 'react';
import Link from 'next/link';
import { FileText, Search, Filter } from 'lucide-react';
import PaperCard from '@/components/PaperCard';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PapersPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const limit = 18;
  const skip = (page - 1) * limit;
  const type = searchParams.type || 'All';

  const where: any = { status: 'APPROVED' };
  if (type !== 'All') {
    where.assessmentType = { contains: type };
  }

  const [total, papers] = await Promise.all([
    prisma.questionPaper.count({ where }),
    prisma.questionPaper.findMany({
      where,
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
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedPapers = papers.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    tags: p.paperTags.map((pt) => pt.tag.name),
  }));

  const paperTypes = ['All', 'CT-1', 'CT-2', 'Final Assessment', 'Midterm'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-blue mb-1">
            <FileText className="w-4 h-4" />
            <span>EXAMINATION REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Previous Year Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mt-1">
            Browse verified CT-1, CT-2, Midterm, and Final Assessment papers with full question scripts and solution guides.
          </p>
        </div>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Advanced Search</span>
        </Link>
      </div>

      {/* Quick Type Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase font-mono mr-2">Filter:</span>
        {paperTypes.map((t) => (
          <Link
            key={t}
            href={`/papers?type=${encodeURIComponent(t)}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
              type === t
                ? 'bg-cyber-blue text-white border-cyber-blue shadow-sm'
                : 'bg-white dark:bg-cyber-card text-slate-600 dark:text-slate-300 border-slate-200 dark:border-cyber-border hover:border-cyber-blue'
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {formattedPapers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pNum = idx + 1;
            return (
              <Link
                key={pNum}
                href={`/papers?page=${pNum}&type=${encodeURIComponent(type)}`}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-semibold flex items-center justify-center border transition-all ${
                  page === pNum
                    ? 'bg-cyber-blue text-white border-cyber-blue shadow-sm'
                    : 'bg-white dark:bg-cyber-card border-slate-200 dark:border-cyber-border text-slate-700 dark:text-slate-300'
                }`}
              >
                {pNum}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
