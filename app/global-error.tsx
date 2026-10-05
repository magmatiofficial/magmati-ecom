'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If it's a chunk loading failure due to a server restart/new build deployment, automatically reload the page once
    if (error?.message?.includes('Loading chunk') || error?.name === 'ChunkLoadError') {
      if (typeof window !== 'undefined') {
        const lastReload = sessionStorage.getItem('last_chunk_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('last_chunk_reload', now.toString());
          window.location.reload();
        }
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>MAGMATI | System Refresh</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FAFAFA', color: '#141414', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#D12929', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
            MAGMATI ATELIER
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 10px 0', color: '#18181B' }}>
            Application Update Detected
          </h1>
          <p style={{ fontSize: '13px', color: '#71717A', maxWidth: '380px', margin: '0 0 24px 0', lineHeight: 1.6 }}>
            A new version of the application was deployed or refreshed. Please reload to load the latest resources.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              backgroundColor: '#D12929',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(209, 41, 41, 0.3)',
            }}
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
