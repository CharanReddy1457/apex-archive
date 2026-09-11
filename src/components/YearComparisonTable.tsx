'use client';

import React from 'react';
import { CourseOfferingDTO } from '@/lib/types';
import { BarChart3, ArrowRight, User } from 'lucide-react';

interface YearComparisonTableProps {
  subjectName: string;
  offerings: CourseOfferingDTO[];
}

export default function YearComparisonTable({ subjectName, offerings }: YearComparisonTableProps) {
  if (!offerings || offerings.length === 0) return null;

  // Collect all unique component names across all offerings
  const allComponentNames = Array.from(
    new Set(
      offerings.flatMap(
        (o) => o.assessmentPattern?.components.map((c) => c.name.split('(')[0].trim()) || []
      )
    )
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-cyber-navy/30 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyber-blue" />
            {subjectName} — Multi-Year Assessment Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-cyber-textMuted mt-0.5">
            Compare evaluation mark distributions across academic years and instructors
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-mono">
              <th className="py-3 px-4 font-semibold">Assessment Component</th>
              {offerings.map((offering) => (
                <th key={offering.id} className="py-3 px-4 text-center font-semibold border-l border-slate-200 dark:border-slate-800">
                  <span className="block text-slate-900 dark:text-white font-bold">
                    {offering.academicYear?.label}
                  </span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-cyber-textMuted flex items-center justify-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-cyber-blue" />
                    {offering.teacher?.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {allComponentNames.map((compName) => (
              <tr key={compName} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                  {compName}
                </td>
                {offerings.map((offering) => {
                  const match = offering.assessmentPattern?.components.find(
                    (c) => c.name.toLowerCase().includes(compName.toLowerCase()) || compName.toLowerCase().includes(c.name.toLowerCase())
                  );

                  return (
                    <td 
                      key={offering.id} 
                      className="py-3 px-4 text-center border-l border-slate-100 dark:border-slate-800"
                    >
                      {match ? (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-cyber-blueSoft text-cyber-blue font-bold text-xs sm:text-sm">
                          {match.maxMarks} M
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Total Row */}
            <tr className="bg-slate-50 dark:bg-cyber-navy/40 font-bold text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-700">
              <td className="py-3.5 px-4 uppercase tracking-wider text-xs">
                Total Max Marks
              </td>
              {offerings.map((offering) => {
                const total = offering.assessmentPattern?.components.reduce(
                  (sum, c) => sum + c.maxMarks,
                  0
                ) || 0;
                return (
                  <td key={offering.id} className="py-3.5 px-4 text-center border-l border-slate-200 dark:border-slate-800">
                    <span className="px-3 py-1 rounded-lg bg-cyber-blue text-white font-mono text-xs sm:text-sm shadow-sm">
                      {total} M
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
