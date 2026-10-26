'use client';

import { useRef } from 'react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { SiteSettingsInitialContext } from '@/hooks/useSiteSettings';
import { CategoriesInitialContext } from '@/hooks/useCategories';
import { CategoryItem } from '@/types';

interface SettingsHydratorProps {
  initial: Record<string, unknown> | null;
  initialCategories?: CategoryItem[] | null;
  children?: React.ReactNode;
}

export function SettingsHydrator({ initial, initialCategories, children }: SettingsHydratorProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    initialized.current = true;
    if (initial !== null) {
      useSiteSettingsStore.setState(initial);
      useSyncStatusStore.getState().markSettingsLoaded();
    }
    if (initialCategories) {
      useCategoryStore.getState().setCategoriesFromServer(initialCategories);
    }
  }

  return (
    <SiteSettingsInitialContext.Provider value={initial}>
      <CategoriesInitialContext.Provider value={initialCategories ?? null}>
        {children}
      </CategoriesInitialContext.Provider>
    </SiteSettingsInitialContext.Provider>
  );
}
