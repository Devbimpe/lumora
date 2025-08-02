import pool from '@db/db.js';
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
  const [users] = await pool.query(
    `SELECT * FROM Users WHERE activationToken = ? AND isActivated = FALSE AND activationTokenExpires > NOW()`,
    [token]
  );

  if (users.length === 0) {
    // Token invalid or expired
    return Response.json({
      error: 'Activation link has expired. Please sign up again.'
    }, { status: 400 });
  }

  const user = users[0];

  // Activate user and clear token
  await pool.query(
    `UPDATE Users SET isActivated = TRUE, activationToken = NULL, activationTokenExpires = NULL WHERE UserID = ?`,
    [user.UserID]
  );

  // Set a session cookie (simple example, use secure session in production)
  const sessionCookie = serialize('user', JSON.stringify({
    id: user.UserID,
    name: user.Name,
    email: user.Email,
    userName: user.Username,
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