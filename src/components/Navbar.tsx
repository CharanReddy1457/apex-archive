'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Search, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert, 
  Sparkles, 
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, switchDemoUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-cyber-border/40 cyber-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-cyber-navy flex items-center justify-center border border-cyber-blue/30 shadow-md group-hover:border-cyber-blue transition-all">
            <GraduationCap className="w-6 h-6 text-cyber-blue group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-cyber-navy dark:text-white">
                APEX<span className="text-cyber-blue">ARCHIVE</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20">
                v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-cyber-textMuted hidden sm:block">
              Academic Previous Paper & Assessment Repository
            </p>
          </div>
        </Link>

        {/* Global Quick Search Bar Button */}
        <div className="hidden md:flex items-center">
          <button
            type="button"
            onClick={() => router.push('/search')}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-cyber-card border border-slate-200 dark:border-cyber-border/40 text-slate-500 dark:text-cyber-textMuted hover:border-cyber-blue hover:text-cyber-blue transition-all w-72 text-sm justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyber-blue" />
              <span>Search subjects, teachers, CT-1...</span>
            </span>
            <kbd className="text-[10px] font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
              /
            </kbd>
          </button>
        </div>

        {/* User Profile & Demo Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-cyber-border/40 hover:border-cyber-blue bg-white/60 dark:bg-cyber-card/80 text-sm transition-all shadow-sm"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-cyber-blue/40" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-cyber-blue/10 text-cyber-blue flex items-center justify-center text-xs font-bold">
                  {user ? user.name[0] : 'G'}
                </div>
              )}
              
              <div className="hidden sm:block text-left text-xs">
                <span className="font-semibold block truncate max-w-[120px] text-slate-900 dark:text-white">
                  {user ? user.name.split(' ')[0] : 'Guest'}
                </span>
                <span className={`text-[10px] uppercase font-mono px-1 py-0.2 rounded font-medium ${
                  user?.role === 'ADMIN'
                    ? 'text-cyber-orange bg-cyber-orange/10'
                    : user?.role === 'CONTRIBUTOR'
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : 'text-cyber-blue bg-cyber-blue/10'
                }`}>
                  {user ? user.role : 'Student'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name || 'Academic Guest'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-cyber-textMuted truncate">
                    {user?.email || 'Browse repository'}
                  </p>
                </div>

                <div className="py-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyber-orange" /> Switch Demo Role
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => { switchDemoUser('ADMIN'); setDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-left"
                  >
                    <span>Admin (Dr. Dean)</span>
                    {user?.role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-cyber-orange" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => { switchDemoUser('CONTRIBUTOR'); setDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-left"
                  >
                    <span>Contributor (TA / Paper Lead)</span>
                    {user?.role === 'CONTRIBUTOR' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => { switchDemoUser('STUDENT'); setDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-left"
                  >
                    <span>Student (Junior CS)</span>
                    {user?.role === 'STUDENT' && <Check className="w-3.5 h-3.5 text-cyber-blue" />}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-cyber-blue" /> Admin Console
                  </Link>

                  {user && (
                    <button
                      type="button"
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
