'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  browserSessionPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as _signOut,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { COLLECTIONS } from '@/app/_db/common';
import { auth, db } from '@/app/_db/client-db';
import { redirect, usePathname } from 'next/navigation';
/** @import { User } from 'firebase/auth' */

/**
 * @typedef {Object} UserProfile
 * @property {'Admin' | 'Student'} role
 */

/**
 * @typedef {object} AuthContextReturn
 * @prop {(User & UserProfile) | null} user
 * @prop {boolean} loading
 * @prop {(email: string, password: string, remember?: boolean) => Promise<void>} signIn
 * @prop {() => Promise<void>} signOut
 */

const AuthContext = createContext(/** @type {AuthContextReturn} */ (null));

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/activate',
  '/contact',
];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((pub) => pathname === pub || pathname === pub + '/');
}

export function AuthProvider({ children }) {
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!isPublicPath(pathname)) {
    auth.authStateReady().then(() => {
      if (!auth.currentUser) {
        console.warn('User is not logged in');
        redirect('/');
      }
    });
  }

  useEffect(() => {
    let unsubAuth = null;
    let unsubDoc = null;

    unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Tear down any previous doc listener
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      unsubDoc = onSnapshot(
        docRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            console.error('User doc missing in Firestore');
            setUser(null);
            return;
          }

          // Order is important; do not allow the Firestore document to override Auth user 
          setUser({ ...snapshot.data(), ...firebaseUser });
          setLoading(false);
        },
        (error) => {
          console.error('User doc listener error:', error);
          setUser(null);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubAuth?.();
      unsubDoc?.();
    };
  }, []);

  /** @type {AuthContextReturn['signIn']} */
  const signIn = useCallback(async (email, password, remember) => {
    if (remember) {
      await auth.setPersistence(browserLocalPersistence);
    } else {
      await auth.setPersistence(browserSessionPersistence);
    }

    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged fires -> onSnapshot picks up the Firestore doc -> setUser()
  }, []);

  const signOut = useCallback(async () => {
    await _signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
