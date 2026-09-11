'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart2, 
  Bookmark, 
  ShieldCheck, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-context';

export default function CyberDock() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Papers', href: '/papers', icon: FileText },
    { label: 'Faculty', href: '/teachers', icon: Users },
    { label: 'Compare', href: '/compare', icon: BarChart2 },
    { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  ];

  // Admin/Contributor link
  if (user && (user.role === 'ADMIN' || user.role === 'CONTRIBUTOR')) {
    navItems.push({ label: 'Admin', href: '/admin', icon: ShieldCheck });
  } else {
    navItems.push({ label: 'Portal', href: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-full px-3">
      <nav 
        aria-label="Cyber Neon Floating Dock"
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl cyber-glass cyber-dock-shadow transition-all duration-300 border border-cyber-blue/30 hover:border-cyber-blue/50"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'text-cyber-blue dark:text-cyber-blue font-semibold bg-cyber-blueSoft'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyber-blue dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-cyber-blue scale-105' : ''}`} />
              <span className="text-[10px] hidden sm:block tracking-wide mt-0.5">{item.label}</span>

              {/* Small Cyber Orange Active Indicator Dot */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyber-orange shadow-cyber-glow-orange animate-pulse" />
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-cyber-orange dark:hover:text-cyber-orange hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-200 group"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 transition-transform duration-200 group-hover:-rotate-12 text-cyber-blue" />
          )}
        </button>
      </nav>
    </div>
  );
}
