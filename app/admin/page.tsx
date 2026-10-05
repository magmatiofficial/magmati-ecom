'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminPage() {
  const router = useRouter();
  const { currentUser, loginUser } = useAuthStore();
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      router.replace('/account?admin=true');
    }
  }, [currentUser, router]);

  if (currentUser?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-xs text-text-subtle font-bold uppercase tracking-wider">
            {'Opening Admin HQ...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full bg-surface-dark rounded-3xl border border-border-dark p-8 shadow-2xl text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border border-red-500/40">
          <ShieldCheck className="w-8 h-8" />
        </div>
        
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white">
            {'Admin Control Center'}
          </h2>
          <p className="text-xs text-text-subtle">
            {'Sign in with your store administrator account to continue.'}
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setAuthError(null);
            const res = await loginUser(adminEmailInput, adminPasswordInput);
            setIsLoading(false);
            if (res.success) {
              const u = useAuthStore.getState().currentUser;
              if (u?.role !== 'admin') {
                setAuthError('This account does not have administrator privileges.');
              } else {
                router.replace('/account?admin=true');
              }
            } else {
              setAuthError(res.error || 'Invalid administrator credentials.');
            }
          }}
          className="space-y-4 pt-2 text-left"
        >
          <div className="space-y-1.5">
            <label className="text-2xs font-bold text-text-subtle uppercase tracking-wider block">
              {'Admin Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="admin@magmati.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-700 bg-zinc-800/90 text-white placeholder:text-text-muted focus:outline-hidden focus:border-primary text-sm"
              />
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-bold text-text-subtle uppercase tracking-wider block">
              {'Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-700 bg-zinc-800/90 text-white placeholder:text-text-muted focus:outline-hidden focus:border-primary text-sm"
              />
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-semibold">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>{'Sign In as Administrator'}</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-border-dark flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-subtle hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{'Back to Storefront'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
