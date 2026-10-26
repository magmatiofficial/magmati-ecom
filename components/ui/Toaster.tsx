'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore, type ToastItem, type ToastType } from '@/store/useToastStore';

const STYLES: Record<ToastType, { icon: React.ElementType; iconWrap: string; title: string }> = {
  success: { icon: CheckCircle2, iconWrap: 'bg-emerald-500/15 text-emerald-400', title: 'Success' },
  error: { icon: AlertCircle, iconWrap: 'bg-primary/15 text-primary', title: 'Error' },
  warning: { icon: AlertTriangle, iconWrap: 'bg-accent/15 text-accent', title: 'Warning' },
  info: { icon: Info, iconWrap: 'bg-sky-500/15 text-sky-400', title: 'Notice' },
};

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const style = STYLES[item.type];
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, dismiss]);

  return (
    <div
      role={item.type === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-4 text-white shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', style.iconWrap)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">{item.title || style.title}</h4>
        <p className="mt-0.5 text-sm font-medium leading-snug text-zinc-400">{item.message}</p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-20 z-[200] flex flex-col gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-full md:max-w-sm"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
