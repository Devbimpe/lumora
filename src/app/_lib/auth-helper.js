/**
 * @typedef {'EMAIL_ALREADY_EXISTS' | 'INVALID_CREDENTIAL' | 'WRONG_PASSWORD' | 'USER_NOT_FOUND' | 'INVALID_EMAIL' | 'WEAK_PASSWORD' | 'INVALID_PASSWORD' | 'USER_DISABLED' | 'TOO_MANY_REQUESTS' | 'OPERATION_NOT_ALLOWED' | 'NETWORK_REQUEST_FAILED' | 'PASSWORD_DOES_NOT_MEET_REQUIREMENTS'} AuthErrorKey
 */

/**
 * Shared user-facing messages keyed by logical auth error type.
 * Both client and server mappings resolve to these.
 * @type {Readonly<Record<AuthErrorKey, string>>}
 */
export const AUTH_ERROR_MESSAGES = Object.freeze({
  EMAIL_ALREADY_EXISTS: 'This email address is already registered.',
  INVALID_CREDENTIAL: 'Incorrect email or password.',
  WRONG_PASSWORD: 'Invalid password.',
  USER_NOT_FOUND: 'Account not found. Please sign up to create one.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD: 'Password does not meet requirements.',
  INVALID_PASSWORD: 'Password does not meet requirements.',
  USER_DISABLED: 'This account has been disabled.',
  TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
  OPERATION_NOT_ALLOWED: 'This sign-in method is not enabled.',
  NETWORK_REQUEST_FAILED: 'Network error. Please check your connection.',
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: 'Password does not meet requirements.',
});

/**
 * Firebase Client SDK (`firebase/auth`) error codes -> logical key.
 * @type {Readonly<Record<string, AuthErrorKey>>}
 */
export const clientAuthErrorMap = Object.freeze({
  'auth/invalid-credential': 'INVALID_CREDENTIAL',
  'auth/wrong-password': 'WRONG_PASSWORD',
  'auth/user-not-found': 'USER_NOT_FOUND',
  'auth/email-already-in-use': 'EMAIL_ALREADY_EXISTS',
  'auth/invalid-email': 'INVALID_EMAIL',
  'auth/weak-password': 'WEAK_PASSWORD',
  'auth/user-disabled': 'USER_DISABLED',
  'auth/too-many-requests': 'TOO_MANY_REQUESTS',
  'auth/operation-not-allowed': 'OPERATION_NOT_ALLOWED',
  'auth/network-request-failed': 'NETWORK_REQUEST_FAILED',
  'auth/password-does-not-meet-requirements': 'PASSWORD_DOES_NOT_MEET_REQUIREMENTS',
});

/**
 * Firebase Admin SDK (`firebase-admin/auth`) error codes -> logical key.
 * @type {Readonly<Record<string, AuthErrorKey>>}
 */
export const serverAuthErrorMap = Object.freeze({
  'auth/email-already-exists': 'EMAIL_ALREADY_EXISTS',
  'auth/invalid-password': 'INVALID_PASSWORD',
  'auth/invalid-email': 'INVALID_EMAIL',
  'auth/user-not-found': 'USER_NOT_FOUND',
  'auth/user-disabled': 'USER_DISABLED',
  'auth/operation-not-allowed': 'OPERATION_NOT_ALLOWED',
});

/**
 * Map a Firebase Auth error to a user-friendly message.
 *
 * @param {{ code?: string, message?: string }} err
 * @param {Record<string, AuthErrorKey>} errorMap - Use `clientAuthErrorMap` or `serverAuthErrorMap`
 * @returns {string}
 */
export function mapAuthError(err, errorMap) {
  const key = err.code && errorMap[err.code];
  if (key) return AUTH_ERROR_MESSAGES[key];
  return err.message || 'An unexpected error occurred.';
}

// Keep in sync with Firebase Auth policy!
/** @param {string} password  */
export function validatePasswordPolicy(password) {
  return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).*$/m.test(password);
}
