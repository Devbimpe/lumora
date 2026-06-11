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

  // Check if token is expired
  if (user.activationTokenExpires && user.activationTokenExpires.toDate() < new Date()) {
    return badRequestError('Activation link has expired. Please log in again.')
  }

  // Activate user and clear token
  await updateUserAccount(user.id, { emailVerified: true });
  await updateUser(user.id, {
    activationToken: null,
    activationTokenExpires: null
  });

  return NextResponse.json({ 
    message: 'Account activated! You can now login with your email and password.',
    redirectTo: '/login'
  }, { status: 200 });
});
