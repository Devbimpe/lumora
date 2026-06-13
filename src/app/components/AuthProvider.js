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
  reload as _reload,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { COLLECTIONS } from '@/app/_db/common';
import { auth, db } from '@/app/_db/client-db';
import { redirect, usePathname } from 'next/navigation';
import '@/app/_lib/api-client'; // Ensure global `fetch` is patched
/** @import { UserDoc } from '@/app/_db/common' */

/**
 * @typedef {Object} UserSession
 * @property {string} uid
 * @property {UserDoc['role']} role
 * @property {import('firebase/auth').User} account
 * @property {Readonly<UserDoc>} doc
 */

/**
 * @typedef {object} AuthContextReturn
 * @property {Readonly<UserSession> | null} user
 * @property {boolean} loading
 * @property {(email: string, password: string, remember?: boolean) => Promise<void>} signIn
 * @property {() => Promise<void>} signOut
 * @property {() => Promise<void>} reload
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

  const [user, setUser] = useState(
    /** @type {Readonly<UserSession> | null} */ (null),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPublicPath(pathname) && !loading) {
      if (!user || (user?.account?.email && !user?.account?.emailVerified)) {
        console.warn('User is not logged in');
        redirect('/');
      }
    }
  }, [pathname, loading, user]);

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
            console.error('User doc missing in Firestore'); // TODO: improve edge case handling
            setUser(null);
            return;
          }

          /** @type {Readonly<UserDoc>} */
          const doc = Object.freeze(snapshot.data());
          setUser(
            Object.freeze({
              get uid() {
                return firebaseUser.uid;
              },
              get role() {
                return doc.role;
              },
              account: firebaseUser,
              doc,
            }),
          );
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

  const reload = useCallback(async () => {
    if (auth.currentUser) await _reload(auth.currentUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, reload }}>
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
