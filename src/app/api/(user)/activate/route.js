import { NextResponse } from 'next/server';
import { getUserByActivationToken, updateUser, updateUserAccount } from '@/app/_db/admin-db.js';
import { badRequestError, definePublicRoute } from '@/app/lib/route';

export const GET = definePublicRoute(async (req) => {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return badRequestError('Invalid activation link.');
  }

  // Find user by token and check expiry
  const user = await getUserByActivationToken(token);

  if (!user) {
    // Token invalid or expired
    return badRequestError('Activation link has expired. Please log in again.')
  }

  // Invalidate the token before anything else
  await updateUser(user.uid, {
    activationToken: null,
    activationTokenExpires: null
  });

  // Check if token is expired
  // This is safe because the `user` object is a snapshot and won't be affected by `updateUser`
  if (user.activationTokenExpires && user.activationTokenExpires.toDate() < new Date()) {
    return badRequestError('Activation link has expired. Please log in again.')
  }

  // Activate user
  await updateUserAccount(user.uid, { emailVerified: true });

  return NextResponse.json({ 
    message: 'Account activated! You can now login with your email and password.',
    redirectTo: '/login'
  }, { status: 200 });
});
