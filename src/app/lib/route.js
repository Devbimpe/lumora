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
 * @typedef {(req: NextRequest) => NextResponse | Promise<NextResponse>} NextRouteHandler
 * @typedef {(req: NextRequest, session: UserSession) => ReturnType<NextRouteHandler>} NextSessionRouteHandler
 * @typedef {(req: NextRequest, session?: UserSession) => ReturnType<NextRouteHandler>} NextPublicRouteHandler
 */

/**
 * @param {'public' | 'user' | 'admin'} type
 * @param {NextPublicRouteHandler | NextSessionRouteHandler} handler
 * @returns {NextRouteHandler}
 */
function defineRoute(type, handler) {
  return async function wrappedHandler(req) {
    const session = await resolveSession(req);

    if (!session) {
      if (type !== 'public') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      if (type !== 'user' && session.role !== 'Admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 },
        );
      }
    }

    return handler(req, session);
  };
}

/**
 * @param {NextPublicRouteHandler} handler
 * @returns {NextRouteHandler}
 */
export function definePublicRoute(handler) {
  return defineRoute('public', handler);
}

/**
 * @param {NextSessionRouteHandler} handler
 * @returns {NextRouteHandler}
 */
export function defineUserRoute(handler) {
  return defineRoute('user', handler);
}

/**
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
 * @template {T}
 * @param {NextRequest} req
 * @returns {Promise<{ body: T, validationError: null } | { body: null, validationError: NextResponse }>}
 */
export async function validateJsonBody(req) {
  const contentType = req.headers.get('content-type');
  if (!contentType?.startsWith('application/json'))
    return {
      body: null,
      validationError: NextResponse.json(
        { error: 'required JSON content type' },
        { status: 400 },
      ),
    };

  let body;
  try {
    body = await req.json();
  } catch {
    return {
      body: null,
      validationError: NextResponse.json(
        { error: 'invalid JSON body' },
        { status: 400 },
      ),
    };
  }

  return { body, validationError: null };
}
