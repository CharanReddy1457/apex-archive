'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-md">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-wider">
          500 APPLICATION ERROR
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Unexpected Server Interruption
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted max-w-md mx-auto leading-relaxed">
          An error occurred while loading this academic resource. Our monitoring system has recorded the incident.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-cyber-border text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-cyber-blue transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Homepage</span>
        </Link>
      </div>
    </div>
  );
}
