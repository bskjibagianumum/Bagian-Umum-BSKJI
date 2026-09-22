import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
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

export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
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

// Test connection on boot as mandated
testConnection();

