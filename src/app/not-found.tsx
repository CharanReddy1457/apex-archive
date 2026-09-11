import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-cyber-blueSoft text-cyber-blue flex items-center justify-center border border-cyber-blue/30 shadow-md">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs font-bold text-cyber-orange uppercase tracking-wider">
          404 ERROR • RESOURCE NOT FOUND
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Academic Document Missing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted max-w-md mx-auto leading-relaxed">
          The requested course, question paper, or faculty profile does not exist or may have been archived.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-cyber-border text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-cyber-blue transition-all"
        >
          <span>Search Repository</span>
        </Link>
      </div>
    </div>
  );
}
