'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

interface ToastInput {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  show: ({ type = 'info', title, message, duration = 4000 }) => {
    counter += 1;
    const id = `toast-${Date.now()}-${counter}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, type, title, message, duration }],
    }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  addToast: (message, type = 'info') => get().show({ message, type }),
  removeToast: (id) => get().dismiss(id),
}));

export const toast = {
  success: (message: string, title?: string) => useToastStore.getState().show({ type: 'success', message, title }),
  error: (message: string, title?: string) => useToastStore.getState().show({ type: 'error', message, title }),
  warning: (message: string, title?: string) => useToastStore.getState().show({ type: 'warning', message, title }),
  info: (message: string, title?: string) => useToastStore.getState().show({ type: 'info', message, title }),
  addToast: (message: string, type: ToastType = 'info') => useToastStore.getState().show({ message, type }),
  removeToast: (id: string) => useToastStore.getState().dismiss(id),
};
