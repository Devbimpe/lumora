import { getUserByActivationToken, updateUser } from '@db/admin-db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Invalid activation link.' }, { status: 400 });
  }

  // Find user by token and check expiry
  const user = await getUserByActivationToken(token);

  if (!user) {
    // Token invalid or expired
    return Response.json({
      error: 'Activation link has expired. Please sign up again.'
    }, { status: 400 });
  }

  // Check if token is expired
  if (user.activationTokenExpires && user.activationTokenExpires.toDate() < new Date()) {
    return Response.json({
      error: 'Activation link has expired. Please sign up again.'
    }, { status: 400 });
  }

  // Activate user and clear token
  await updateUser(user.id, {
    isActivated: true,
    activationToken: null,
    activationTokenExpires: null
  });

  // Note: Firebase Auth user is already created during signup
  // We just need to activate our custom user document
  // The user can now login using Firebase Auth credentials
  
  return Response.json({ 
    message: 'Account activated! You can now login with your email and password.',
    redirectTo: '/login'
  }, { status: 200 });
}