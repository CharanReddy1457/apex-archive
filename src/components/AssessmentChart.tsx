'use client';

import React from 'react';
import { AssessmentPatternDTO } from '@/lib/types';
import { Award, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AssessmentChartProps {
  pattern: AssessmentPatternDTO | null | undefined;
  title?: string;
  subtitle?: string;
}

export default function AssessmentChart({ pattern, title = 'Assessment Breakdown', subtitle }: AssessmentChartProps) {
  if (!pattern || !pattern.components || pattern.components.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-cyber-card border border-dashed border-slate-300 dark:border-cyber-border text-center">
        <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 dark:text-cyber-textMuted font-medium">
          No assessment pattern defined for this offering yet.
        </p>
      </div>
    );
  }

  // Calculate actual total from components
  const calculatedTotal = pattern.components.reduce((sum, c) => sum + (c.maxMarks || 0), 0);
  const is100 = calculatedTotal === 100;
  const isOver = calculatedTotal > 100;

  // Max component mark to scale bars proportionally
  const maxMark = Math.max(...pattern.components.map((c) => c.maxMarks), 1);

  // Palette colors for component types
  const getComponentColor = (type: string, index: number) => {
    switch (type?.toUpperCase()) {
      case 'FINAL':
        return {
          bg: 'bg-cyber-blue',
          text: 'text-cyber-blue',
          border: 'border-cyber-blue/30',
          gradient: 'from-blue-600 to-cyber-blue',
        };
      case 'PROJECT':
        return {
          bg: 'bg-cyber-orange',
          text: 'text-cyber-orange',
          border: 'border-cyber-orange/30',
          gradient: 'from-amber-500 to-cyber-orange',
        };
      case 'TEST':
        return {
          bg: 'bg-indigo-500',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
          gradient: 'from-indigo-600 to-indigo-400',
        };
      case 'QUIZ':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          gradient: 'from-emerald-600 to-emerald-400',
        };
      case 'ASSIGNMENT':
        return {
          bg: 'bg-purple-500',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          gradient: 'from-purple-600 to-purple-400',
        };
      default:
        return {
          bg: 'bg-cyan-500',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
          gradient: 'from-cyan-600 to-cyan-400',
        };
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-5 h-5 text-cyber-blue" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Total Score Badge */}
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-mono">Total Scheme</span>
          <span className={`text-lg sm:text-xl font-mono font-black ${
            is100 ? 'text-cyber-blue' : isOver ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {calculatedTotal} / 100 Marks
          </span>
        </div>
      </div>

      {/* Pattern Note if any */}
      {pattern.note && (
        <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/30 border border-slate-200/80 dark:border-cyber-border/40 text-xs text-slate-600 dark:text-cyber-textMuted">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Scheme Note: </span>
          {pattern.note}
        </div>
      )}

      {/* Validation Warning Alert */}
      {!is100 && (
        <div className="my-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
          <span>
            {isOver
              ? `Warning: Total components exceed standard 100 marks (${calculatedTotal} marks).`
              : `Notice: Total components sum to ${calculatedTotal} marks (less than 100).`}
          </span>
        </div>
      )}

      {/* Visual Component Bars */}
      <div className="space-y-4 mt-5">
        {pattern.components.map((comp, idx) => {
          const color = getComponentColor(comp.type, idx);
          const percentageOf100 = Math.min((comp.maxMarks / 100) * 100, 100);

          return (
            <div key={comp.id || idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2 font-mono">
                  <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                  {comp.name}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {comp.maxMarks} Marks ({percentageOf100.toFixed(0)}%)
                </span>
              </div>

              {/* Progress Bar with cyber accents */}
              <div className="w-full h-3.5 bg-slate-100 dark:bg-cyber-navy/80 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-cyber-border/40">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color.gradient} transition-all duration-700 shadow-sm`}
                  style={{ width: `${Math.max(percentageOf100, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cumulative Breakdown Strip */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-mono text-slate-400 block mb-2">
          Cumulative Weightage Distribution
        </span>
        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
          {pattern.components.map((comp, idx) => {
            const color = getComponentColor(comp.type, idx);
            const sliceWidth = calculatedTotal > 0 ? (comp.maxMarks / calculatedTotal) * 100 : 0;
            return (
              <div
                key={comp.id || idx}
                title={`${comp.name}: ${comp.maxMarks} Marks`}
                className={`${color.bg} h-full transition-all`}
                style={{ width: `${sliceWidth}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
