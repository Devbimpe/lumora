import pool from '../../../../db/db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return Response.json({ error: 'Invalid activation link.' }, { status: 400 });
  }

  const [users] = await pool.query(
    'SELECT * FROM Users WHERE Email = ? AND activationToken = ?',
    [email, token]
  );

  if (users.length === 0) {
    return Response.json({ error: 'Invalid or expired activation link.' }, { status: 400 });
  }
 await pool.query(
  'UPDATE Users SET is_activated = 1, activation_token = NULL WHERE Email = ?',
  [email]
);

// Redirect to login page after activation
return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, 302);
}