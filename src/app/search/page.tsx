'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import PaperCard from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/SkeletonLoaders';
import EmptyState from '@/components/EmptyState';
import { QuestionPaperDTO, DepartmentDTO, SemesterDTO, TeacherDTO } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Query state from URL
  const query = searchParams.get('q') || '';
  const dept = searchParams.get('dept') || 'All';
  const sem = searchParams.get('sem') || 'All';
  const teacher = searchParams.get('teacher') || 'All';
  const year = searchParams.get('year') || 'All';
  const assessment = searchParams.get('assessment') || 'All';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [papers, setPapers] = useState<QuestionPaperDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Facet data
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [teachers, setTeachers] = useState<TeacherDTO[]>([]);

  // Load facet lists once
  useEffect(() => {
    async function loadFacets() {
      try {
        const [deptRes, teachRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/teachers'),
        ]);
        if (deptRes.ok) {
          const dData = await deptRes.json();
          setDepartments(dData.departments || []);
        }
        if (teachRes.ok) {
          const tData = await teachRes.json();
          setTeachers(tData.teachers || []);
        }
      } catch (err) {
        console.error('Failed loading facets', err);
      }
    }
    loadFacets();
  }, []);

  // Update URL helper
  const updateParams = useCallback((newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [key, val] of Object.entries(newParams)) {
      if (!val || val === 'All') {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    }
    // Always reset page to 1 when changing filters, unless explicitly setting page
    if (!newParams.page && newParams.page !== '1') {
      current.delete('page');
    }
    router.push(`/search?${current.toString()}`);
  }, [searchParams, router]);

  // Fetch papers on filter changes
  useEffect(() => {
    let isCancelled = false;
    async function fetchResults() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (dept && dept !== 'All') params.set('dept', dept);
        if (sem && sem !== 'All') params.set('sem', sem);
        if (teacher && teacher !== 'All') params.set('teacher', teacher);
        if (year && year !== 'All') params.set('year', year);
        if (assessment && assessment !== 'All') params.set('assessment', assessment);
        params.set('page', page.toString());
        params.set('limit', '12');

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setPapers(data.papers || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
          }
        }
      } catch (err) {
        console.error('Search fetch error', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchResults();
    return () => {
      isCancelled = true;
    };
  }, [query, dept, sem, teacher, year, assessment, page]);

  return (
    <div className="space-y-6">
      
      {/* Top Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            initialQuery={query}
            variant="compact"
            onSearch={(q) => updateParams({ q })}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-xs font-semibold shadow-sm w-full sm:w-auto justify-center"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyber-blue" />
          <span>Filters & Facets</span>
        </button>
      </div>

      {/* Active Filter Chips */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {total} {total === 1 ? 'Paper' : 'Papers'} Found
          </span>

          {query && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/30 font-mono">
              Query: &quot;{query}&quot;
              <button type="button" onClick={() => updateParams({ q: null })} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}

          {dept !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
              Dept: {dept}
              <button type="button" onClick={() => updateParams({ dept: null })} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}

          {sem !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
              Sem {sem}
              <button type="button" onClick={() => updateParams({ sem: null })} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}

          {year !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
              AY {year}
              <button type="button" onClick={() => updateParams({ year: null })} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}

          {assessment !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/30 font-mono">
              Type: {assessment}
              <button type="button" onClick={() => updateParams({ assessment: null })} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}
        </div>

        {total > 0 && (
          <span className="text-slate-400 font-mono text-[11px]">
            Showing page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Main Layout: Sidebar Filters + Results Grid */}
      <div className="flex gap-6 items-start">
        
        {/* Filter Panel (Desktop & Mobile Drawer) */}
        <FilterPanel
          departments={departments}
          semesters={semesters}
          teachers={teachers}
          selectedDept={dept}
          selectedSem={sem}
          selectedTeacher={teacher}
          selectedYear={year}
          selectedAssessment={assessment}
          onFilterChange={(k, v) => updateParams({ [k]: v })}
          onReset={() => {
            router.push('/search');
          }}
          isMobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Paper Results Grid */}
        <div className="flex-1 w-full space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))}
            </div>
          ) : papers.length === 0 ? (
            <EmptyState
              title="No question papers match your query"
              description="Try adjusting your keywords, selecting 'All' for departments or teachers, or resetting filters."
              actionText="Clear All Filters"
              onAction={() => router.push('/search')}
              icon="search"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {papers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: (page - 1).toString() })}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyber-blue"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => updateParams({ page: pNum.toString() })}
                        className={`w-8 h-8 rounded-xl font-mono text-xs font-semibold border transition-all ${
                          page === pNum
                            ? 'bg-cyber-blue text-white border-cyber-blue shadow-sm'
                            : 'border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card text-slate-700 dark:text-slate-300 hover:border-cyber-blue'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: (page + 1).toString() })}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyber-blue"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-mono">Loading Search Hub...</div>}>
      <SearchContent />
    </Suspense>
  );
}
