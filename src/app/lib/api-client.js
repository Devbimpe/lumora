import { auth } from '@/app/_db/client-db';
import ky, { isHTTPError } from 'ky';

export const api = ky.extend({
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    beforeRetry: [
      async ({ request, error, retryCount }) => {
        if (
          retryCount < 2 &&
          isHTTPError(error) &&
          error.response.status === 401
        ) {
          if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken(true);
            request.headers.set('Authorization', `Bearer ${token}`);
          } else {
            throw error; // we're not logged in, stop retrying
          }
        }
      },
    ],
  },
});
