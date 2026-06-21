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
  onIdTokenChanged,
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

  /**
   * @param {UserSession['account'] | null} firebaseUser
   * @param {UserSession['doc'] | null} doc
   */
  function updateUserObject(firebaseUser, doc) {
    if (!firebaseUser) {
      setUser(null);
    } else if (!doc) {
      console.error('User doc missing in Firestore'); // TODO: improve edge case handling
      setUser(null);
    } else {
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
    }
  }

  useEffect(() => {
    let unsubAuth = null;
    let unsubToken = null;
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
            updateUserObject(firebaseUser, null);
            return;
          }

          const doc = Object.freeze(snapshot.data());
          updateUserObject(firebaseUser, doc);
          setLoading(false);
        },
        (error) => {
          console.error('User doc listener error:', error);
          setUser(null);
          setLoading(false);
        },
      );
    });

    unsubToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;
      const tokenData = await firebaseUser.getIdTokenResult();
      if (tokenData) {
        delete tokenData['token'];
        console.log('User token claim:', tokenData);
      }
    });

    return () => {
      unsubAuth?.();
      unsubToken?.();
      unsubDoc?.();
    };
  }, []);

  /** @type {AuthContextReturn['signIn']} */
  const signIn = useCallback(async (email, password, remember) => {
    if (auth.currentUser) {
      // Ensure user object is cleared first for React state
      await _signOut(auth);
    }

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
    if (auth.currentUser) {
      await _reload(auth.currentUser);
      await auth.currentUser.getIdToken(true); // Force refresh token
    }
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
