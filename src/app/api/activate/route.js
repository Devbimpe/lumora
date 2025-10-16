import { getUserByActivationToken, updateUser } from '@db/db.js';
import { cookies as getCookies } from 'next/headers'; 
// Install cookie with command "npm install cookie" before running this code
import { serialize } from 'cookie'; 

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

  // Set a session cookie (simple example, use secure session in production)
  const sessionCookie = serialize('user', JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    userName: user.username,
  }), {
    httpOnly: true,
    path: '/',
    maxAge: 30*60, // 30 minutes
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  const cookies = await getCookies(); // Await here!
  cookies.set('user', sessionCookie);
  
  return Response.json({ message: 'Account activated!' }, { status: 200 });
}