import { getUserById, verifyIdToken } from '@/app/_db/admin-db';
import { NextResponse } from 'next/server';
/** @import { NextRequest } from 'next/server' */
/** @import { DecodedIdToken } from 'firebase-admin/auth' */
/** @import { UserDoc } from '@/app/_db/common' */

/**
 * @typedef {{
 *   readonly uid: string;
 *   readonly role: UserDoc['role'],
 *   readonly claim: Readonly<DecodedIdToken>,
 *   readonly doc: UserDoc | null
 * }} UserSession
 */

/**
 * @typedef {(req: NextRequest, ctx?: any) => NextResponse | Promise<NextResponse>} NextRouteHandler
 * @typedef {(req: NextRequest, session: UserSession, ctx?: any) => ReturnType<NextRouteHandler>} NextSessionRouteHandler
 * @typedef {(req: NextRequest, session: undefined, ctx?: any) => ReturnType<NextRouteHandler>} NextPublicRouteHandler
 */

/**
 * @param {'public' | 'user' | 'unverified_user' | 'admin'} type
 * @param {NextPublicRouteHandler | NextSessionRouteHandler} handler
 * @returns {NextRouteHandler}
 */
function defineRoute(type, handler) {
  return async function wrappedHandler(req, ...rest) {
    const session = await resolveSession(req);

    if (!session) {
      if (type !== 'public') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      switch (type) {
        case 'public':
        case 'user':
          if (session.claim.email && !session.claim.email_verified) {
            return accessForbiddenError('User email is not verified');
          }
        // fallthrough
        case 'unverified_user':
          break;
        case 'admin':
          if (session.role !== 'Admin') {
            return accessForbiddenError('Admin access required');
          }
          break;
        default:
          throw new TypeError(`invalid route type: ${type}`);
      }
    }

    return handler(req, session, ...rest);
  };
}

/**
 * Define a public route accessible without authentication.
 * @param {NextPublicRouteHandler} handler
 * @returns {NextRouteHandler}
 */
export function definePublicRoute(handler) {
  return defineRoute('public', handler);
}

/**
 * Define a route requiring authenticated user with verified email.
 * @param {NextSessionRouteHandler} handler
 * @returns {NextRouteHandler}
 */
export function defineUserRoute(handler) {
  return defineRoute('user', handler);
}

/**
 * Define a route requiring authenticated user (email verification not required).
 * @param {NextSessionRouteHandler} handler
 * @returns {NextRouteHandler}
 */
export function defineUnverifiedUserRoute(handler) {
  return defineRoute('unverified_user', handler);
}

/**
 * Define a route requiring admin privileges.
 * @param {NextSessionRouteHandler} handler
 * @returns {NextRouteHandler}
 */
export function defineAdminRoute(handler) {
  return defineRoute('admin', handler);
}

/**
 * @param {NextRequest} req
 * @returns {Promise<UserSession | null>}
 */
async function resolveSession(req) {
  const header = req.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.substring('Bearer '.length);

  try {
    const decoded = await verifyIdToken(token);
    const doc = await getUserById(decoded.uid);

    return Object.freeze({
      get uid() {
        return decoded.uid;
      },
      get role() {
        return doc?.role || 'Unknown';
      },
      claim: decoded,
      doc,
    });
  } catch {
    return null;
  }
}

/**
 * Check if the user with the specified session can access data with a specific owner.
 *
 * @param {UserSession} [session]
 * @param {string} ownerId
 * @returns {boolean}
 */
export function verifyOwnership(session, ownerId) {
  if (session.role === 'Admin') {
    return true;
  }

  return session.uid === ownerId;
}

/**
 * @param {string} message
 * @returns {NextResponse}
 */
export async function badRequestError(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * @param {string} [message]
 * @returns {NextResponse}
 */
export async function accessForbiddenError(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * @param {string} [message]
 * @returns {NextResponse}
 */
export async function internalServerError(message = 'An error occurred.') {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * @template {T}
 * @param {NextRequest} req
 * @param {(this: NextRequest, body: T | any) => string | undefined} [validator]
 * @returns {Promise<{ body: T, validationError: null } | { body: null, validationError: NextResponse }>}
 */
export async function validateJsonBody(req, validator) {
  const contentType = req.headers.get('content-type');
  if (!contentType?.startsWith('application/json'))
    return {
      body: null,
      validationError: badRequestError('required JSON content type'),
    };

  let body;
  try {
    body = await req.json();
  } catch {
    return {
      body: null,
      validationError: badRequestError('malformed JSON body'),
    };
  }

  if (typeof validator === 'function') {
    let error;
    try {
      error = validator.call(req, body);
    } catch {
      return {
        body: null,
        validationError: badRequestError('malformed request body'),
      };
    }

    if (typeof error !== 'undefined' && error !== null)
      return {
        body: null,
        validationError: NextResponse.json({ error }, { status: 400 }),
      };
  } else if (typeof validator === 'undefined') {
    // No validator
  } else {
    throw new TypeError('unsupported validator type');
  }

  return { body, validationError: null };
}

/**
 * Gets the client ip from proxy headers. Do NOT trust unless behind trusted proxy.
 * 
 * @param {NextRequest} req
 * @returns {string | undefined}
 */
export function extractClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',', 2)[0].trim() : undefined;
}
