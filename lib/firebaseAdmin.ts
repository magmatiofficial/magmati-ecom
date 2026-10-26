import { getApps, initializeApp, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfigRaw from '../firebase-applet-config.json';
import { type AppletFirebaseConfig } from './firebase';

const firebaseConfig = firebaseConfigRaw as AppletFirebaseConfig;

let adminApp: App;
let isAdminDbReady = false;

if (getApps().length === 0) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (serviceAccountJson) {
    try {
      const parsed = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
      adminApp = initializeApp({
        credential: cert(parsed),
        projectId: firebaseConfig.projectId,
      });
      isAdminDbReady = true;
      console.log(`[FirebaseAdmin] Initialized with service account for project: ${firebaseConfig.projectId}`);
    } catch {
      console.error(`[FirebaseAdmin] FATAL: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Admin SDK is NOT usable.`);
      adminApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
      isAdminDbReady = false;
    }
  } else {
    console.error(`[FirebaseAdmin] WARNING: No FIREBASE_SERVICE_ACCOUNT_KEY and no ADC detected. Server-side Firestore writes WILL FAIL. Set FIREBASE_SERVICE_ACCOUNT_KEY in your environment.`);
    isAdminDbReady = false;
    try {
      adminApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    } catch {
      try {
        adminApp = initializeApp();
      } catch {
        adminApp = getApp();
      }
    }
  }
} else {
  adminApp = getApp();
  isAdminDbReady = true;
}

// Initialize Firestore for custom databaseId
let adminDb: Firestore;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  // Treat empty, missing, or '(default)' as the default database
  if (dbId && dbId.trim() !== '' && dbId !== '(default)') {
    adminDb = getFirestore(adminApp, dbId);
  } else {
    adminDb = getFirestore(adminApp);
  }
} catch {
  adminDb = getFirestore(adminApp);
}

try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {}

const adminAuth: Auth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth, isAdminDbReady };
