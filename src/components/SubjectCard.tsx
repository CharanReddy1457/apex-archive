'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, FileText, ArrowRight, User } from 'lucide-react';
import { SubjectDTO } from '@/lib/types';

interface SubjectCardProps {
  subject: SubjectDTO;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      href={`/subjects/${subject.code}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border/60 p-5 shadow-sm hover:shadow-cyber-card-dark hover:border-cyber-blue transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/20">
            {subject.code}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-cyber-textMuted bg-slate-100 dark:bg-cyber-navy/50 px-2 py-0.5 rounded">
            {subject.semester?.label || 'Semester'} • {subject.credits} Credits
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyber-blue transition-colors line-clamp-1 mb-1.5">
          {subject.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-cyber-textMuted line-clamp-2 mb-4 leading-relaxed">
          {subject.description || 'Comprehensive curriculum with syllabus, module breakdowns, and previous examination papers.'}
        </p>

        {subject.coordinator && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
            <User className="w-3.5 h-3.5 text-cyber-blue" />
            <span className="truncate">Coordinator: {subject.coordinator}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="flex items-center gap-1 font-mono text-slate-500 dark:text-cyber-textMuted">
          <FileText className="w-3.5 h-3.5 text-cyber-orange" />
          {subject.papersCount || 0} Papers Available
        </span>

        <span className="text-cyber-blue font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Subject <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
