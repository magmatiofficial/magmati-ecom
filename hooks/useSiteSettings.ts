'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export type SiteSettingsState = ReturnType<typeof useSiteSettingsStore.getState>;

export const SiteSettingsInitialContext = createContext<Record<string, unknown> | null>(null);

const identity = <T>(s: T): T => s;

export function useSiteSettings<T = SiteSettingsState>(selector?: (s: SiteSettingsState) => T): T {
  const ctx = useContext(SiteSettingsInitialContext);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const initialState = useMemo(
    () => ({ ...useSiteSettingsStore.getInitialState(), ...(ctx ?? {}) }) as SiteSettingsState,
    [ctx]
  );
  const sel = selector ?? (identity as (s: SiteSettingsState) => T);
  const live = useSiteSettingsStore(sel);
  return hydrated ? live : sel(initialState);
}
