import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, memoryLocalCache, memoryLruGarbageCollector, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigRaw from '../firebase-applet-config.json';

export interface AppletFirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  firestoreDatabaseId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

const firebaseConfig = firebaseConfigRaw as AppletFirebaseConfig;

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use custom firestore databaseId with memoryLocalCache to avoid iframe IndexedDB security permission errors
let db: ReturnType<typeof getFirestore>;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  const firestoreSettings = {
    localCache: memoryLocalCache({
      garbageCollector: memoryLruGarbageCollector()
    }),
  };
  
  // Treat empty, missing, or '(default)' as the default database
  if (dbId && dbId.trim() !== '' && dbId !== '(default)') {
    db = initializeFirestore(app, firestoreSettings, dbId);
  } else {
    db = initializeFirestore(app, firestoreSettings);
  }
  // Mute harmless gRPC stream cancellation warnings (e.g. idle connections timing out) in Next.js backend logs
  setLogLevel('error');
} catch {
  db = getFirestore(app);
}

const auth = getAuth(app);

/**
 * Recursively strips undefined values from an object or array
 * so Firestore setDoc / updateDoc does not reject writes.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as any;
  }
  return data;
}

export { app, db, auth };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}


