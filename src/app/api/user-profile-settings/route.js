import { getUserById, deleteUser } from '@/app/_db/admin-db.js';
import {
  accessForbiddenError,
  badRequestError,
  defineUserRoute,
  internalServerError,
  validateJsonBody,
  verifyOwnership,
} from '@/app/lib/route';
import { NextResponse } from 'next/server';

export const POST = defineUserRoute(async (req, session) => {
  try {
    const { body, validationError } = await validateJsonBody(req);
    if (validationError) return validationError;
    const { userId } = body;

    if (!userId) {
      return badRequestError('Missing userId');
    }

    if (!verifyOwnership(session, userId)) return accessForbiddenError();

    const user = await getUserById(userId);
    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await deleteUser(userId);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    return internalServerError();
  }
});
