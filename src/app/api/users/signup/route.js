import { adminAuth } from '@/firebaseAdmin.js';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
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

    const db = admin.firestore();
    const usersRef = db.collection('users');

    // Securely check if a user with the provided username already exists in Firestore
    const existingByUsernameSnapshot = await usersRef.where('username', '==', userName).limit(1).get();

    if (!existingByUsernameSnapshot.empty) {
      return Response.json({ error: 'Username already exists.' }, { status: 400 });
    }

    // Securely create Firebase Auth user using Admin SDK
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // Generate a random activation token for our custom flow (48 bytes, hex-encoded)
    const activationToken = crypto.randomBytes(48).toString('hex');
    // Set token expiration to 30 minutes from now
    const expires = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));

    // Securely create the user document in Firestore, bypassing standard security rules
    await usersRef.add({
      firebaseUid: userRecord.uid, // Link to Firebase Auth user
      name: name,
      username: userName,
      email: email,
      role: 'Student',
      percentModulesCompleted: 0,
      isActivated: false, // We'll set this to true after email verification
      activationToken: activationToken,
      activationTokenExpires: expires,
      createdAt: admin.firestore.Timestamp.now()
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
    console.error('Signup error:', err);
    
    // Pass user-friendly Firebase Auth errors to the frontend (Admin SDK error codes)
    if (err.code === 'auth/email-already-exists' || err.code === 'auth/email-already-in-use') {
      return Response.json({ error: 'This email address is already registered.' }, { status: 400 });
    }
    if (err.code === 'auth/invalid-password') {
      return Response.json({ error: 'Password should be at least 6 characters.' }, { status: 400 });
    }
    if (err.code === 'auth/invalid-email') {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Return the specific error message to the client (to avoid swallowing useful errors)
    const errorMessage = err.message || 'Server error.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}