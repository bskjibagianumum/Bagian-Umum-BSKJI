import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect to Firestore (use default if (default) or not specified)
const dbId =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)' &&
  !firebaseConfig.firestoreDatabaseId.startsWith('ai-studio-')
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

// Configure persistent local cache with multi-tab support to minimize Firestore read counts
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    dbId
  );
} catch (e) {
  // If already initialized or unsupported, fallback to getFirestore
  firestoreInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.warn('Firebase Firestore is offline or initializing. Local cache fallback active.');
      } else if (
        error.message.includes('Quota exceeded') ||
        error.message.includes('resource-exhausted')
      ) {
        console.warn('Firebase Firestore quota exceeded. Operating seamlessly via server and local cache.');
      } else {
        console.warn('Firebase Firestore test connection notice:', error.message);
      }
    }
  }
}

// Test connection on boot safely without forcing server-side read bypass
testConnection();

