'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, User, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        router.push('/');
      } else {
        setError('Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setError('Login request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: 'ADMIN' | 'CONTRIBUTOR' | 'STUDENT') => {
    await switchDemoUser(role);
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      
      {/* Brand Icon */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-cyber-navy flex items-center justify-center mx-auto border border-cyber-blue/30 shadow-md">
          <GraduationCap className="w-8 h-8 text-cyber-blue" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sign In to Apex Archive
        </h1>
        <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
          Access course question paper banks, dynamic assessment patterns, and faculty uploads.
        </p>
      </div>

      {/* 1-Click Fast Demo Accounts */}
      <div className="p-4 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyber-orange" />
          <span>Quick Demo Access (Select Role):</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoClick('ADMIN')}
            className="p-2.5 rounded-xl border border-cyber-orange/30 bg-cyber-orange/10 hover:bg-cyber-orange hover:text-white text-cyber-orange text-xs font-bold transition-all text-center"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('CONTRIBUTOR')}
            className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 text-xs font-bold transition-all text-center"
          >
            Contributor
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('STUDENT')}
            className="p-2.5 rounded-xl border border-cyber-blue/30 bg-cyber-blueSoft hover:bg-cyber-blue hover:text-white text-cyber-blue text-xs font-bold transition-all text-center"
          >
            Student
          </button>
        </div>
      </div>

      {/* Standard Credentials Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
            University Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. student@campus.edu"
            className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

    </div>
  );
}
