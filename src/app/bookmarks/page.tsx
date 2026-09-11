'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, FileText, BookOpen, Trash2 } from 'lucide-react';
import PaperCard from '@/components/PaperCard';
import SubjectCard from '@/components/SubjectCard';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/lib/auth-context';
import { QuestionPaperDTO, SubjectDTO } from '@/lib/types';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<QuestionPaperDTO[]>([]);
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const handleBookmarkToggle = (paperId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
    }
  };

  if (!user) {
    return (
      <EmptyState
        title="Sign in to view Bookmarks"
        description="Save previous papers and subjects to your personal academic dashboard for quick exam revision."
        actionText="Switch Demo User"
        actionHref="/auth/login"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-orange mb-1">
          <Bookmark className="w-4 h-4 fill-cyber-orange" />
          <span>SAVED ARCHIVES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          My Saved Bookmarks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mt-1">
          Quickly access your pinned examination papers, course outlines, and faculty test records.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : papers.length === 0 && subjects.length === 0 ? (
        <EmptyState
          title="No bookmarked papers yet"
          description="Click the bookmark star icon on any question paper card or subject page to add it here."
          actionText="Browse Available Papers"
          actionHref="/papers"
        />
      ) : (
        <div className="space-y-8">
          
          {/* Saved Papers */}
          {papers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyber-blue" />
                Saved Question Papers ({papers.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {papers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Saved Subjects */}
          {subjects.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyber-orange" />
                Saved Subjects ({subjects.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjects.map((sub) => (
                  <SubjectCard key={sub.id} subject={sub} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
