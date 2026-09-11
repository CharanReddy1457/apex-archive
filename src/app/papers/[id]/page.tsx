'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Award, 
  Clock, 
  Calendar, 
  User, 
  BookOpen, 
  Bookmark, 
  Share2, 
  FileText, 
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { QuestionPaperDTO } from '@/lib/types';

export default function PaperDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [paper, setPaper] = useState<QuestionPaperDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'solutions'>('preview');

  useEffect(() => {
    async function loadPaper() {
      try {
        const res = await fetch(`/api/papers/${id}`);
        if (!res.ok) {
          setError('Question paper not found');
          return;
        }
        const data = await res.json();
        setPaper(data.paper);
        setIsBookmarked(data.paper.isBookmarked || false);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadPaper();
  }, [id]);

  const handleBookmark = async () => {
    if (!paper) return;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, action: nextState ? 'add' : 'remove' }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-28 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-[600px] w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <EmptyState
        title="Question Paper Not Found"
        description="The paper you are looking for might have been moved or removed."
        actionText="Browse Papers"
        actionHref="/papers"
      />
    );
  }

  const subject = paper.courseOffering?.subject;
  const teacher = paper.courseOffering?.teacher;
  const year = paper.courseOffering?.academicYear?.label;

  return (
    <div className="space-y-6">
      
      {/* Back Link */}
      <Link
        href={`/subjects/${subject?.code || ''}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-cyber-textMuted hover:text-cyber-blue transition-colors font-mono"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to {subject?.name || 'Subject'}
      </Link>

      {/* Header Info Card */}
      <div className="rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/30">
                {paper.assessmentType}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-cyber-navy/50 text-slate-600 dark:text-slate-300">
                AY {year}
              </span>
              {paper.examDate && (
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-cyber-navy/50 text-slate-600 dark:text-slate-300">
                  {paper.examDate}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {paper.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 flex-wrap pt-1">
              <Link href={`/subjects/${subject?.code}`} className="flex items-center gap-1.5 hover:text-cyber-blue font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-cyber-blue" />
                <span>{subject?.name} ({subject?.code})</span>
              </Link>
              <span>•</span>
              <Link href={`/teachers/${teacher?.id}`} className="flex items-center gap-1.5 hover:text-cyber-blue">
                <User className="w-3.5 h-3.5 text-cyber-blue" />
                <span>{teacher?.name}</span>
              </Link>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                isBookmarked
                  ? 'bg-cyber-orange/10 border-cyber-orange text-cyber-orange shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyber-blue'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyber-orange' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <a
              href={paper.fileUrl}
              download={paper.fileName}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-sm hover:shadow-cyber-glow-blue transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* Paper Specs Bar */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-600 dark:text-cyber-textMuted font-mono pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Award className="w-4 h-4 text-cyber-orange" />
            Maximum: {paper.maxMarks} Marks
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyber-blue" />
            Duration: {paper.durationMinutes} Minutes
          </span>
          <span>File: {paper.fileName} ({(paper.fileSize / 1024).toFixed(0)} KB)</span>
        </div>

        {/* Tags */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="flex items-center gap-2 pt-3 flex-wrap">
            <span className="text-xs text-slate-400 font-mono">Tags:</span>
            {paper.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-cyber-navy/40 text-slate-700 dark:text-slate-300 hover:text-cyber-blue border border-slate-200/60 dark:border-cyber-border/30"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tabs: Document Preview vs Solutions */}
      {paper.solutionNotes && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-cyber-blue text-white shadow-sm'
                : 'bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-slate-600 dark:text-slate-300'
            }`}
          >
            Question Paper Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('solutions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'solutions'
                ? 'bg-cyber-orange text-white shadow-sm'
                : 'bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-slate-600 dark:text-slate-300'
            }`}
          >
            Faculty Solution Notes
          </button>
        </div>
      )}

      {/* Document Viewport */}
      {activeTab === 'preview' ? (
        <div className="w-full h-[750px] rounded-3xl overflow-hidden border border-slate-200 dark:border-cyber-border bg-slate-900/10 dark:bg-black/50 shadow-xl">
          <iframe
            src={`${paper.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={paper.title}
          />
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border p-6 sm:p-8 space-y-4">
          <div className="p-4 rounded-2xl bg-cyber-blueSoft border border-cyber-blue/20">
            <h3 className="text-sm font-bold text-cyber-blue flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Academic Solution Commentary
            </h3>
            <p className="text-xs text-slate-600 dark:text-cyber-textMuted mt-1">
              Guidelines provided by {teacher?.name || 'course examiner'}.
            </p>
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {paper.solutionNotes}
          </div>
        </div>
      )}

    </div>
  );
}
