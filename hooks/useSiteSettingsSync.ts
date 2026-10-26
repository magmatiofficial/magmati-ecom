'use client';

import { useEffect, useRef } from 'react';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '@/lib/firebase';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { stripRetiredSections } from '@/lib/sectionLayouts';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { revalidateStorefrontCache } from '@/lib/revalidateStorefront';
import { fetchStorefront } from '@/lib/clientStorefront';

const SETTINGS_COLLECTION = 'site_settings';
const SETTINGS_DOC_ID = 'storefront';
const WRITE_DEBOUNCE_MS = 800;
let lastSyncedJson = '';

/** Keeps only the plain data fields of the store (drops all actions/functions). */
function pickData(state: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function') data[key] = value;
  }
  return data;
}

/**
 * Shared storefront settings (Firestore document site_settings/storefront).
 * - Admin: live onSnapshot listener, so the admin panel always reflects remote changes.
 * - Visitors: single cached request via fetchStorefront() (/api/storefront). Only falls back to one direct Firestore read if that returns null.
 * - Publish: only a signed-in admin writes changes back (debounced 800ms) and revalidates the server cache via revalidateStorefrontCache().
 */
export function useSiteSettingsSync() {
  const isAdmin = useAuthStore((state) => state.currentUser?.role === 'admin');
  const applyingRemote = useRef(false);

  // 1) Receive the shared settings
  useEffect(() => {
    const { markSettingsLoaded } = useSyncStatusStore.getState();
    if (!db) {
      markSettingsLoaded();
      return;
    }
    const firestore = db;
    const safetyTimer = setTimeout(() => {
      markSettingsLoaded();
    }, 5000);

    const applyRemote = (data: Record<string, unknown>) => {
      applyingRemote.current = true;
      try {
        useSiteSettingsStore.setState(stripRetiredSections(data));
        lastSyncedJson = JSON.stringify(pickData(useSiteSettingsStore.getState() as unknown as Record<string, unknown>));
      } finally {
        applyingRemote.current = false;
      }
    };

    // Admin: live listener, so the admin panel always shows the newest data.
    if (isAdmin) {
      const ref = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const unsubscribe = onSnapshot(
        ref,
        (snap) => {
          markSettingsLoaded();
          if (!snap.exists()) return;
          applyRemote(snap.data() as Record<string, unknown>);
        },
        (error) => {
          markSettingsLoaded();
          console.error('Site settings sync failed', error);
        }
      );
      return () => {
        clearTimeout(safetyTimer);
        unsubscribe();
      };
    }

    // Visitors: one shared cached request. Only if it fails, read Firestore once directly.
    let cancelled = false;
    fetchStorefront().then(async (data) => {
      if (cancelled) return;
      if (data) {
        markSettingsLoaded();
        if (data.settings) applyRemote(data.settings);
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
        if (cancelled) return;
        markSettingsLoaded();
        if (snap.exists()) applyRemote(snap.data() as Record<string, unknown>);
      } catch (error) {
        if (cancelled) return;
        markSettingsLoaded();
        console.error('Site settings sync failed', error);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [isAdmin]);

  // 2) Admin only: publish local changes
  useEffect(() => {
    if (!db || !isAdmin) return;
    const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    let timer: ReturnType<typeof setTimeout> | null = null;

    let lastSuccessAt = 0;
    let lastErrorAt = 0;
    const publish = (silent = false) => {
      const data = pickData(useSiteSettingsStore.getState() as unknown as Record<string, unknown>);
      lastSyncedJson = JSON.stringify(pickData(useSiteSettingsStore.getState() as unknown as Record<string, unknown>));
      setDoc(ref, sanitizeForFirestore(data))
        .then(() => {
          revalidateStorefrontCache();
          const now = Date.now();
          if (!silent && now - lastSuccessAt > 5000) {
            lastSuccessAt = now;
            toast.success('Site settings saved.');
          }
        })
        .catch((error) => {
          lastSyncedJson = '';
          console.error('Site settings publish failed', error);
          const now = Date.now();
          if (now - lastErrorAt > 10000) {
            lastErrorAt = now;
            toast.error('Could not save site settings. Please try again.');
          }
        });
    };
    // First admin visit: create the shared document from the current settings if it does not exist yet
    getDoc(ref)
      .then((snap) => {
        if (!snap.exists() && useSyncStatusStore.getState().settingsLoaded) {
          publish(true);
        }
      })
      .catch((error) => console.error('Site settings check failed', error));

    const unsubscribe = useSiteSettingsStore.subscribe(() => {
      if (applyingRemote.current) return;
      if (!useSyncStatusStore.getState().settingsLoaded) return;
      const nowJson = JSON.stringify(pickData(useSiteSettingsStore.getState() as unknown as Record<string, unknown>));
      if (nowJson === lastSyncedJson) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => publish(), WRITE_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [isAdmin]);
}
