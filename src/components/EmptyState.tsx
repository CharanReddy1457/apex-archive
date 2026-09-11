'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, Upload, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: 'paper' | 'search' | 'generic';
}

export default function EmptyState({
  title = 'No question papers found',
  description = 'No previous assessment papers matched your current filters.',
  actionText,
  actionHref,
  onAction,
  icon = 'paper',
}: EmptyStateProps) {
  const { user } = useAuth();
  const canUpload = user && (user.role === 'ADMIN' || user.role === 'CONTRIBUTOR');

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white dark:bg-cyber-card border border-dashed border-slate-300 dark:border-cyber-border my-6">
      <div className="w-14 h-14 rounded-2xl bg-cyber-blueSoft text-cyber-blue flex items-center justify-center mb-4 shadow-sm border border-cyber-blue/20">
        {icon === 'search' ? (
          <Search className="w-7 h-7" />
        ) : (
          <FileQuestion className="w-7 h-7" />
        )}
      </div>

      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h4>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action link / button */}
      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          {actionText || 'Browse Directory'}
        </Link>
      ) : onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          {actionText || 'Reset Filters'}
        </button>
      ) : canUpload ? (
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Paper Copy</span>
        </Link>
      ) : (
        <p className="text-xs text-slate-400 font-mono">
          Paper hasn&apos;t been added yet. Check back later or contact a course contributor.
        </p>
      )}
    </div>
  );
}
