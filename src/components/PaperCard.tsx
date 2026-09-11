'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  Award, 
  Bookmark, 
  CheckCircle2, 
  Calendar, 
  User, 
  Check 
} from 'lucide-react';
import { QuestionPaperDTO } from '@/lib/types';
import PaperViewerModal from './PaperViewerModal';

interface PaperCardProps {
  paper: QuestionPaperDTO;
  onBookmarkToggle?: (paperId: string, isBookmarked: boolean) => void;
}

export default function PaperCard({ paper, onBookmarkToggle }: PaperCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(paper.isBookmarked || false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, action: nextState ? 'add' : 'remove' }),
      });
      if (onBookmarkToggle) onBookmarkToggle(paper.id, nextState);
    } catch (err) {
      console.error(err);
    }
  };

  const subject = paper.courseOffering?.subject;
  const teacher = paper.courseOffering?.teacher;
  const year = paper.courseOffering?.academicYear?.label;

  // Format file size nicely
  const formattedSize = paper.fileSize > 0 
    ? `${(paper.fileSize / 1024).toFixed(0)} KB` 
    : 'PDF Document';

  return (
    <>
      <div className="relative flex flex-col justify-between rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border/60 p-5 shadow-sm hover:shadow-cyber-card-dark hover:border-cyber-blue transition-all duration-300 group">
        
        {/* Top bar: Assessment type and Academic Year */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wide uppercase bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/20">
                {paper.assessmentType}
              </span>
              {paper.status === 'APPROVED' && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Verified</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-cyber-textMuted bg-slate-100 dark:bg-cyber-navy/40 px-2 py-0.5 rounded border border-slate-200/60 dark:border-cyber-border/40">
                {year || 'AY'}
              </span>

              <button
                type="button"
                onClick={handleBookmark}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark paper'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'text-cyber-orange bg-cyber-orange/10'
                    : 'text-slate-400 hover:text-cyber-orange hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyber-orange' : ''}`} />
              </button>
            </div>
          </div>

          {/* Subject Title & Code */}
          <div className="mb-2">
            <Link 
              href={`/subjects/${subject?.code || ''}`}
              className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-cyber-blue transition-colors line-clamp-1"
            >
              {subject?.name || paper.title}
            </Link>
            {subject?.code && (
              <span className="text-xs font-mono text-slate-400 dark:text-cyber-textMuted">
                {subject.code} • {subject.department?.code || 'ENG'}
              </span>
            )}
          </div>

          {/* Teacher Info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
            <User className="w-3.5 h-3.5 text-cyber-blue flex-shrink-0" />
            <Link 
              href={`/teachers/${teacher?.id || ''}`}
              className="hover:underline hover:text-cyber-blue truncate"
            >
              {teacher?.name || 'Faculty Member'}
            </Link>
          </div>

          {/* Marks & Duration metadata */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-cyber-textMuted py-2 border-t border-b border-slate-100 dark:border-slate-800/80 mb-3 font-mono">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold">
              <Award className="w-3.5 h-3.5 text-cyber-orange" />
              {paper.maxMarks} Marks
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyber-blue" />
              {paper.durationMinutes} Mins
            </span>
            <span>•</span>
            <span className="truncate">{formattedSize}</span>
          </div>

          {/* Tags */}
          {paper.tags && paper.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {paper.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-cyber-navy/50 text-slate-600 dark:text-cyber-textMuted border border-slate-200/60 dark:border-cyber-border/30"
                >
                  #{tag}
                </span>
              ))}
              {paper.tags.length > 3 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{paper.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: View Paper & Download */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-sm hover:shadow-cyber-glow-blue transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Paper</span>
          </button>

          <a
            href={paper.fileUrl}
            download={paper.fileName || 'question_paper.pdf'}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>

          <Link
            href={`/papers/${paper.id}`}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyber-blue text-slate-400 hover:text-cyber-blue transition-colors"
            title="Open Dedicated Page"
          >
            <FileText className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Embedded In-Browser Modal PDF Viewer */}
      {viewerOpen && (
        <PaperViewerModal
          paper={paper}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
