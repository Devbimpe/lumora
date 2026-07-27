'use client';
import ky from 'ky';
import { auth } from '@/app/_db/client-db';

export const api = ky.extend({
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        if (!isSameOrigin(request.url)) return;

        // Ensure auth state is fully loaded before making requests
        await auth.authStateReady();

        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});

/**
 * Extract a human-readable error message from a ky HTTPError (which carries the server
 * response body), falling back to `fallback` when the body isn't usable. Non-HTTP errors
 * (e.g. network) also fall back.
 * @param {unknown} err
 * @param {string} fallback
 * @returns {Promise<string>}
 */
export async function apiErrorMessage(err, fallback) {
  if (err && typeof err === 'object') {
    let { data, response } = err; // ky `HTTPError`
    if (!data && response) {
      try {
        data = await response.json();
      } catch {
        /* ignore */
      }
    }

    if (data && typeof data === 'object' && typeof data.error === 'string')
      return data.error;
  }
  return fallback;
}

/** @param {URL | string} url */
function isSameOrigin(url) {
  if (typeof location === 'undefined') return false; // SSR: treat all as cross-origin
  if (!(url instanceof URL)) url = new URL(url, location.href);
  return url.origin === location.origin;
}
