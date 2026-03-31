// Import database functions
import { getUserByEmail, getUserByUsername, createUser } from '@db/db.js';
// Import Firebase Auth functions
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@db/firebase.js';
// Import nodemailer for sending custom activation emails
import nodemailer from 'nodemailer';
// Import crypto for generating secure random tokens
import crypto from 'crypto';
import { Timestamp } from 'firebase/firestore';
import { getAppOrigin } from "@/src/app/lib/app-origin.js";

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

    // Check if a user with the provided username already exists in Firestore
    const existingByUsername = await getUserByUsername(userName);

    if (existingByUsername) {
      return Response.json({ error: 'Username already exists.' }, { status: 400 });
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Generate a random activation token for our custom flow (48 bytes, hex-encoded)
    const activationToken = crypto.randomBytes(48).toString('hex');
    // Set token expiration to 30 minutes from now
    const expires = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));

    // Create the user document in Firestore with our custom fields
    await createUser({
      firebaseUid: firebaseUser.uid, // Link to Firebase Auth user
      name: name,
      username: userName,
      email: email,
      isActivated: false, // We'll set this to true after email verification
      activationToken: activationToken,
      activationTokenExpires: expires,
      role: 'Student',
      percentModulesCompleted: 0
    });

    // Configure nodemailer transporter for sending emails via Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587, // Use port 587 instead of 465
      secure: false, // Use TLS instead of SSL
      auth: {
        user: process.env.EMAIL_USER, // Gmail user from environment variables
        pass: process.env.EMAIL_PASS, // Gmail password/app-specific password from environment variables
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    // Define the activation URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const activationUrl = `${baseUrl.replace(/\/$/, '')}/activate?token=${activationToken}`;

    // Send activation email to the user
    try {
      await transporter.sendMail({
        from: `"Lumora Support" <${process.env.EMAIL_USER}>`, // Sender email
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
      console.log('✅ Activation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send activation email:', emailError.message);
      // Don't fail the signup if email fails - user can still be created
      console.log('⚠️ User created but activation email failed to send');
    }

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