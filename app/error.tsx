'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error captured:', error);
  }, [error]);

  return (
    <div id="error-boundary-container" className="min-h-[70dvh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
        APPLICATION ERROR
      </span>
      <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-950 mb-3">
        Something Went Wrong
      </h1>
      <p className="text-xs text-zinc-500 max-w-sm mb-6">
        An unexpected error occurred while loading this page. Please try refreshing or return to the homepage.
      </p>
      <div className="flex items-center gap-3">
        <button
          id="retry-error-btn"
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="px-6 py-3 rounded-full bg-primary text-app-inverse text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors"
        >
          Try Again
        </button>
        <Link
          id="return-home-from-error-btn"
          href="/"
          className="px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
