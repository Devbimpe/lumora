import crypto from 'node:crypto';
import ky from 'ky';

// Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

/**
 * @param {string} token
 * @param {string} expectedAction
 * @param {string} [ip]
 * @returns {Promise<boolean>}
 */
export async function verifyTurnstile(token, expectedAction, ip) {
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return false;
  }

  if (!expectedAction) throw new TypeError('expectedAction not specified');

  // default to always-fail test key
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '2x0000000000000000000000000000000AA';
  const isTestKey = /^\dx0{31}[A-Z]{2}$/.test(secretKey);

  const idempotencyKey = crypto.randomUUID();
  const resp = await ky
    .post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      throwHttpErrors: false,
      json: {
        secret: secretKey,
        response: token,
        remoteip: ip,
        idempotency_key: idempotencyKey,
      },
      retry: {
        limit: 3,
        methods: ['get', 'post', 'head', 'options'],
      },
    });

  if (!resp.ok) {
    return false;
  }

  const validation = await resp.json();
  if (!validation.success) {
    return false;
  }

  if (!isTestKey && validation.action !== expectedAction) {
    return false;
  }

  return true;
}
