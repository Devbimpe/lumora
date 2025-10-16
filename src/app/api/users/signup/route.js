// Import database functions
import { getUserByEmail, getUserByUsername, createUser } from '@db/db.js';
// Import bcrypt for password hashing
import bcrypt from 'bcryptjs';
// Import nodemailer for sending activation emails
import nodemailer from 'nodemailer';
// Import crypto for generating secure random tokens
import crypto from 'crypto';
import { Timestamp } from 'firebase/firestore';

// POST handler: Handles user signup
// Expects a JSON body with 'name', 'userName', 'email', and 'password' fields
export async function POST(req) {
  try {
    // Parse the JSON body to extract user details
    const { name, userName, email, password } = await req.json();

    // Validate that all required fields are provided
    if (!name || !userName || !email || !password) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Check if a user with the provided username or email already exists
    const existingByEmail = await getUserByEmail(email);
    const existingByUsername = await getUserByUsername(userName);
    
    if (existingByEmail || existingByUsername) {
      return Response.json({ error: 'Username or email already exists.' }, { status: 400 });
    }

    // Hash the password with bcrypt (using 10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate a random activation token (48 bytes, hex-encoded)
    const activationToken = crypto.randomBytes(48).toString('hex');
    // Set token expiration to 30 minutes from now
    const expires = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));

    // Create the new user with inactive status
    await createUser({
      name: name,
      username: userName,
      password: hashedPassword,
      email: email,
      isActivated: false,
      activationToken: activationToken,
      activationTokenExpires: expires
    });

    // Configure nodemailer transporter for sending emails via Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Gmail user from environment variables
        pass: process.env.EMAIL_PASS, // Gmail password/app-specific password from environment variables
      },
    });

    // Define the activation URL for development environment
    // Note: Replace with production URL (e.g., https://lumora.com/activate?token=...) when deploying
    const activationUrl = `http://localhost:3000/activate?token=${activationToken}`;
    
    // Send activation email to the user
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender email
      to: email, // Recipient email
      subject: 'Activate your Lumora Account', // Email subject
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for registering with Lumora!</p>
        <p>To complete your registration, please click the link below within 30 minutes:</p>
        <p><a href="${activationUrl}">Activate your account</a></p>
        <p>If you did not sign up, you can ignore this email.</p>
      `, // Email body with activation link
    });

    // Return successful response with instructions for the user
    return Response.json({
      message: "Check your email — we’ve sent you an activation link to complete your registration."
    }, { status: 200 });

  } catch (err) {
    // Log any errors during the signup process
    console.error(err);
    // Return generic error response for the client
    return Response.json({ error: 'Server error.' }, { status: 500 });
  }
}