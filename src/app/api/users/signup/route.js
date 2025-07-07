import pool from '../../../../../db/db.js'; // Adjust path based on your folder structure
import bcrypt from 'bcryptjs';
export async function POST(req) {
  try {
    const { userName, email, password, name } = await req.json();

    // Validate required fields
    if (!userName || !email || !password || !name) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Check if username or email already exists
    const [existing] = await pool.query(
      'SELECT * FROM Users WHERE Username = ? OR Email = ?',
      [userName, email]
    );
    if (existing.length > 0) {
      return Response.json({ error: 'Username or email already exists.' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (default role: Student)
    await pool.query(
    'INSERT INTO Users (Username, Password, Email) VALUES (?, ?, ?)',
    [userName, hashedPassword, email,name]
);

    return Response.json({ message: 'Signup successful!' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Server error.' }, { status: 500 });
  }
}