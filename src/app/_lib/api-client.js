'use client';
import ky from 'ky';
import { auth } from '@/app/_db/client-db';

const _fetch = globalThis.fetch.bind(globalThis);

// Patch global `fetch` to inject Bearer token for compatibility with legacy code.
// All new code should prefer the ky `api` instance.
if (typeof location !== 'undefined') {
  async function fetch(input, init = {}) {
    const url =
      typeof input === 'string' || input instanceof URL ? input : input.url;

    if (isSameOrigin(url)) {
      const token = await auth.currentUser?.getIdToken(); // auto-refreshes
      if (token) {
        const headers = new Headers(init.headers);
        headers.set('Authorization', `Bearer ${token}`);
        init = { ...init, headers };
      }
    }

    return _fetch(input, init);
  }

  globalThis.fetch = Object.defineProperties(fetch, {
    original: { value: _fetch, configurable: true },
  });
}

export const api = ky.extend({
  fetch: _fetch,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        if (isSameOrigin(request.url) && auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});

/** @param {URL | string} url */
function isSameOrigin(url) {
  if (typeof location === 'undefined') return false; // SSR: treat all as cross-origin
  if (!(url instanceof URL)) url = new URL(url, location.href);
  return url.origin === location.origin;
}
