import { getApps, initializeApp, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfigRaw from '../firebase-applet-config.json';
import { type AppletFirebaseConfig } from './firebase';

const firebaseConfig = firebaseConfigRaw as AppletFirebaseConfig;

let adminApp: App;

if (getApps().length === 0) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const hasServiceAccount = Boolean(serviceAccountJson);

  if (serviceAccountJson) {
    try {
      const parsed = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
      adminApp = initializeApp({
        credential: cert(parsed),
        projectId: firebaseConfig.projectId,
      });
      console.log(`[FirebaseAdmin] Initialized Admin App with service account for project: ${firebaseConfig.projectId}`);
    } catch (err) {
      console.warn(`[FirebaseAdmin] Failed to parse service account JSON, falling back to ADC for project: ${firebaseConfig.projectId}`);
      adminApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  } else {
    console.log(`[FirebaseAdmin] Initializing Admin App using ADC for project: ${firebaseConfig.projectId}`);
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

export { adminApp, adminDb, adminAuth };
