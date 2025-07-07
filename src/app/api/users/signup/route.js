// Smaple code for the API route to fetch users from the database:
// TODO: This is a demo function for the backend. This should be removed once other backend functions get added to /src/app/api'
import pool from '../../../../../db/db.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { userName, email, password } = await req.json();

    if (!userName || !email || !password) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const [existing] = await pool.query(
      'SELECT * FROM Users WHERE Username = ? OR Email = ?',
      [userName, email]
    );
    if (existing.length > 0) {
      return Response.json({ error: 'Username or email already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'INSERT INTO Users (Username, Password, Email, is_activated, activation_token) VALUES (?, ?, ?, ?, ?)',
      [userName, hashedPassword, email, false, activationToken]
    );

    // Send activation email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const activationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/activate?token=${activationToken}&email=${encodeURIComponent(email)}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Activate your account',
      html: `<p>Click <a href="${activationUrl}">here</a> to activate your account.</p>`,
    });

    return Response.json({ message: 'Signup successful! Please check your email to activate your account.' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Server error.' }, { status: 500 });
  }
}