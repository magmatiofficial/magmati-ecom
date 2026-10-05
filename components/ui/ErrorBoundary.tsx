'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React application render error:', error, errorInfo);

    // If chunk loading failed (e.g. after code update, dev rebuild or stale browser chunk cache), automatically hard-refresh once
    if (
      typeof window !== 'undefined' &&
      error &&
      (
        error.name === 'ChunkLoadError' ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('chunk') ||
        error.message?.includes('Load failed')
      )
    ) {
      const reloadKey = 'magmati_chunk_reload_' + window.location.pathname;
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 5000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
        return;
      }
    }
  }

  private handleResetAndRecover = () => {
    try {
      // Proactively purge local storage to clear any corrupted state keys (Zustand, theme, etc.)
      localStorage.clear();
      sessionStorage.clear();
      // Hard refresh the page
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Elegant Luxury Error Recovery Page
      return (
        <div className="min-h-screen bg-app-bg flex flex-col justify-center items-center py-16 px-4 font-sans text-center">
          <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200/80 shadow-2xl p-8 relative overflow-hidden space-y-6">
            {/* Top decorative styling bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-hover to-secondary" />

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-subtle text-primary mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                {this.state.error?.message?.includes('Loading chunk') || this.state.error?.name === 'ChunkLoadError'
                  ? 'New Version Available'
                  : 'Oops! Something went wrong'}
              </h2>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                {this.state.error?.message?.includes('Loading chunk') || this.state.error?.name === 'ChunkLoadError'
                  ? 'The application was just updated. Please reload the page to load the latest version.'
                  : 'An unexpected rendering issue occurred. Our system has automatically caught this crash to ensure your session remains stable.'}
              </p>
            </div>

            {/* Technical Detail Collapsible (Invisible by default, for administrators) */}
            {this.state.error && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-left">
                <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                  Diagnostic Information
                </span>
                <p className="text-2xs font-mono text-zinc-600 truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Quick Action recovery grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="h-11 flex items-center justify-center gap-2 bg-secondary hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetAndRecover}
                className="h-11 flex items-center justify-center gap-2 border border-primary hover:bg-primary-subtle text-primary rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Clear & Reset State</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full h-11 flex items-center justify-center gap-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 text-xs font-bold transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
