'use client';

import React from 'react';

export function PaperCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/80 dark:border-cyber-border/40 p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded my-2" />
      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function SubjectCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/80 dark:border-cyber-border/40 p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-cyber-border p-4 animate-pulse space-y-3">
      <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  );
}
