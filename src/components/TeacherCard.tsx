'use client';

import React from 'react';
import Link from 'next/link';
import { User, BookOpen, FileText, MapPin, ArrowRight } from 'lucide-react';
import { TeacherDTO } from '@/lib/types';

interface TeacherCardProps {
  teacher: TeacherDTO;
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border/60 p-5 shadow-sm hover:shadow-cyber-card-dark hover:border-cyber-blue transition-all duration-300"
    >
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          {teacher.avatar ? (
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-12 h-12 rounded-xl object-cover border border-cyber-blue/30 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/30 flex items-center justify-center font-bold text-base flex-shrink-0">
              {teacher.name.split(' ').map((n) => n[0]).join('')}
            </div>
          )}

          <div className="overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyber-blue transition-colors truncate">
              {teacher.name}
            </h3>
            <p className="text-xs text-cyber-blue font-medium truncate">
              {teacher.title}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-cyber-textMuted truncate">
              {teacher.department?.name || 'Computer Science'}
            </p>
          </div>
        </div>

        {teacher.cabin && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-cyber-textMuted mb-2">
            <MapPin className="w-3.5 h-3.5 text-cyber-orange flex-shrink-0" />
            <span className="truncate">{teacher.cabin}</span>
          </div>
        )}

        {teacher.bio && (
          <p className="text-xs text-slate-500 dark:text-cyber-textMuted line-clamp-2 leading-relaxed mb-4">
            {teacher.bio}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="flex items-center gap-1 font-mono text-slate-500 dark:text-cyber-textMuted">
          <FileText className="w-3.5 h-3.5 text-cyber-blue" />
          {teacher.papersCount || 0} Papers Archive
        </span>

        <span className="text-cyber-blue font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Profile <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
