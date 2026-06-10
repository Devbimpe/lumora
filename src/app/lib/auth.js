import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken 
} from 'firebase/auth';
import { auth } from '@/app/_db/firebase.js';

// Client-side authentication utilities
export class AuthService {
  // Sign in with email and password
  static async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the ID token for API calls
      const idToken = await user.getIdToken();
      
      return {
        success: true,
        user: user,
        idToken: idToken
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sign out
  static async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Get current user's ID token
  static async getCurrentUserToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Make authenticated API calls
  static async makeAuthenticatedRequest(url, options = {}) {
    const token = await this.getCurrentUserToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }
}

// App session logout (clears server cookie + notifies UI)
export async function logoutAndBroadcast() {
  // Clear Firebase session if used (best-effort).
  try {
    await signOut(auth);
  } catch {
    // Ignore: app session may be cookie-based only.
  }

  const res = await fetch("/api/logout", { method: "POST" });
  if (!res.ok) {
    throw new Error(`Logout failed with status ${res.status}`);
  }

  // Notify any listeners (e.g. Header) to re-check auth.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }

  return true;
}

export default AuthService;
