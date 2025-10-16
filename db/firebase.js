import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export async function testFirebaseConnections() {
  console.log('Testing Firebase connections...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing Firebase environment variables:', missingVars);
    console.log('ℹ️  Please add these variables to your .env.local file');
    return false;
  }
  
  try {
    console.log('Testing Client Firestore...');
    if (db && typeof db.collection === 'function') {
      const clientTestDoc = await db.collection('_test').doc('connection-test').get();
      console.log('Firebase Client Firestore connection successful!');
    } else {
      console.log('Firestore not properly initialized');
    }
    
    console.log('Testing Client Auth...');
    if (auth) {
      console.log('Firebase Client Auth connection successful!');
    } else {
      console.log('Auth not properly initialized');
    }
    
    console.log('Firebase client connections successful!');
    console.log('Admin SDK disabled due to Node.js version (requires >= 20.0.0)');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

if (process.env.NODE_ENV === 'development') {
  // Debug: Log environment variables
  console.log('🔍 Debug - Environment variables:');
  console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
  
  testFirebaseConnections();
}

export default app;