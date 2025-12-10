// // Import core Firebase modules needed for app initialization and specific services
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration object
// These values are stored as environment variables for security and flexibility.
// NEXT_PUBLIC_ prefix allows access in client-side code in Next.js.
// This configuration is used to initialize the Firebase app.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
// Export initialized Firebase services so they can be imported anywhere in the project.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firestore database service for CRUD operations on collections.
export const db = getFirestore(app);
// Export Authentication service for user management.
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
// Initialize analytics only on the client-side (window object is undefined on the server)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
// Utility function to test Firebase connection and check environment variables
export async function testFirebaseConnections() {
  // Only run on client side to avoid hydration issues
  if (typeof window === 'undefined') {
    return false;
  }
  
  console.log('Testing Firebase connections...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  // Initialize Firebase app only once to prevent duplicate instances.
// If an app already exists, re-use it instead of initializing again.
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    // Only run on client-side to avoid issues during server-side rendering
  if (missingVars.length > 0) {
    console.error('Missing Firebase environment variables:', missingVars);
    console.log('ℹ️  Please add these variables to your .env.local file');
    return false;
  }
   // Identify missing environment variables
   // If any are missing, log an error and return false.
  try {
    // If all required variables are present, log success and return true.
    console.log('✅ Firebase initialized successfully!');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Test connection only on client side when needed
// Don't run automatically to avoid hydration issues

export default app;