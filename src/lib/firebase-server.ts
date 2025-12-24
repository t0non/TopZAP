import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for Server Side (using Client SDK in Node environment)
// Note: In a real production environment with strict rules, 
// you should use firebase-admin with a service account.
// For this setup, we rely on the Client SDK.

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
