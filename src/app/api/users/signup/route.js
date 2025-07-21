<<<<<<< Updated upstream
import pool from '../../../../../db/db.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

=======
import bcrypt from 'bcryptjs';
import pool from '../../../../../db/db.js'; // Adjust path based on your folder structure
>>>>>>> Stashed changes
export async function POST(req) {
  try {
    const { name, userName, email, password } = await req.json();

    if (!name || !userName || !email || !password) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Check for existing user
    const [existing] = await pool.query(
      'SELECT * FROM Users WHERE Username = ? OR Email = ?',
      [userName, email]
    );
    if (existing.length > 0) {
      return Response.json({ error: 'Username or email already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(48).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    await pool.query(
      `INSERT INTO Users (Username, Password, Email, isActivated, activationToken, activationTokenExpires)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userName, hashedPassword, email, false, activationToken, expires]
    );

    // Send activation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // const activationUrl = `https://lumora.com/activate?token=${activationToken}`;
    // This is only for the development environment
    const activationUrl = `http://localhost:3000/activate?token=${activationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Activate your Lumora Account',
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for registering with Lumora!</p>
        <p>To complete your registration, please click the link below within 30 minutes:</p>
        <p><a href="${activationUrl}">Activate your account</a></p>
        <p>If you did not sign up, you can ignore this email.</p>
      `,
    });

    return Response.json({
      message: "Check your email — we’ve sent you an activation link to complete your registration."
    }, { status: 200 });

  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Server error.' }, { status: 500 });
  }
}