'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  variant?: 'hero' | 'compact';
  onSearch?: (query: string) => void;
}

export default function SearchBar({ initialQuery = '', variant = 'hero', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query.trim());
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const suggestions = [
    'DBMS CT-1',
    'DBMS Ravi Kumar',
    'CS501 2025',
    'Operating Systems CT-2',
    'Final assessment Computer Networks',
    'Normalization',
  ];

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-cyber-blue" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, codes, teachers, tags, papers..."
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-cyber-card border border-slate-200 dark:border-cyber-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-cyber-blue text-slate-800 dark:text-white transition-all shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <div className="relative flex items-center rounded-2xl bg-white dark:bg-cyber-card border border-slate-200/90 dark:border-cyber-border shadow-xl hover:border-cyber-blue dark:hover:border-cyber-blue transition-all duration-300 p-2 sm:p-2.5 focus-within:ring-2 focus-within:ring-cyber-blue/50 focus-within:border-cyber-blue">
          <div className="pl-3 pr-2 text-cyber-blue">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject, teacher, code, paper (e.g. DBMS CT-1 Ravi Kumar)..."
            className="w-full bg-transparent px-2 py-2 text-base sm:text-lg focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-cyber-textMuted"
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white font-medium text-sm sm:text-base transition-all shadow-md hover:shadow-cyber-glow-blue active:scale-95 flex-shrink-0"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4 hidden sm:block" />
          </button>
        </div>
      </form>

      {/* Recommended Academic Suggestions */}
      <div className="flex items-center gap-2 mt-3.5 flex-wrap justify-center sm:justify-start">
        <span className="text-xs text-slate-400 dark:text-cyber-textMuted flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyber-orange" /> Try:
        </span>
        {suggestions.map((sug) => (
          <button
            key={sug}
            type="button"
            onClick={() => {
              setQuery(sug);
              router.push(`/search?q=${encodeURIComponent(sug)}`);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-cyber-navy/50 text-slate-600 dark:text-slate-300 hover:bg-cyber-blueSoft hover:text-cyber-blue border border-slate-200/60 dark:border-cyber-border/40 transition-all font-mono"
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  );
}
