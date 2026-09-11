'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Award, 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { QuestionPaperDTO } from '@/lib/types';

interface PaperViewerModalProps {
  paper: QuestionPaperDTO;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaperViewerModal({ paper, isOpen, onClose }: PaperViewerModalProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'paper' | 'solution'>('paper');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subject = paper.courseOffering?.subject;
  const teacher = paper.courseOffering?.teacher;
  const year = paper.courseOffering?.academicYear?.label;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className={`relative flex flex-col bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden ${
          fullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh]'
        }`}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-cyber-navy/40 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-cyber-blue/10 text-cyber-blue flex items-center justify-center flex-shrink-0 font-bold text-xs">
              PDF
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {paper.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-cyber-textMuted truncate">
                {subject?.name} ({subject?.code}) • {teacher?.name} • AY {year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View / Solution Notes Switch */}
            {paper.solutionNotes && (
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs mr-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('paper')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'paper'
                      ? 'bg-white dark:bg-cyber-navy text-cyber-blue font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Question Paper
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('solution')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'solution'
                      ? 'bg-white dark:bg-cyber-navy text-cyber-orange font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Solution Notes
                </button>
              </div>
            )}

            {/* Download Button */}
            <a
              href={paper.fileUrl}
              download={paper.fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-blue hover:bg-blue-600 text-white text-xs font-medium shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: PDF embed or Solution Notes */}
        <div className="flex-1 w-full h-full bg-slate-900/5 dark:bg-black/40 overflow-hidden relative flex">
          {activeTab === 'paper' ? (
            <iframe
              src={`${paper.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title={paper.title}
            />
          ) : (
            <div className="w-full h-full p-6 overflow-y-auto bg-white dark:bg-cyber-card">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="p-4 rounded-xl bg-cyber-blueSoft border border-cyber-blue/20">
                  <h4 className="font-semibold text-cyber-blue text-sm flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4" /> Faculty Solution & Guidance Notes
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-cyber-textMuted">
                    Provided for academic reference by {teacher?.name || 'course instructor'}.
                  </p>
                </div>
                <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {paper.solutionNotes || 'No specific solution notes provided for this paper.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta Details */}
        <div className="px-6 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-cyber-card flex items-center justify-between text-xs text-slate-500 dark:text-cyber-textMuted flex-shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-mono font-semibold text-slate-700 dark:text-slate-300">
              <Award className="w-3.5 h-3.5 text-cyber-orange" /> Max: {paper.maxMarks} Marks
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyber-blue" /> Duration: {paper.durationMinutes} Mins
            </span>
            <span>File: {paper.fileName}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
              Press ESC to exit
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
