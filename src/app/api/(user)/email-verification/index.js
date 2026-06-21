import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { Timestamp, updateUser } from '@/app/_db/admin-db';

export async function sendEmailVerification(uid, name, email) {
  // Generate a random activation token for our custom flow
  const activationToken = crypto.randomBytes(32).toString('hex');
  // Set token expiration to 30 minutes from now
  const expires = Timestamp.fromMillis(Date.now() + 30 * 60 * 1000);

  await updateUser(uid, {
    activationToken: activationToken,
    activationTokenExpires: expires,
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
      rejectUnauthorized: false, // Allow self-signed certificates
    },
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
              text: ` 
Hello ${name},
Thank you for registering with Lumora!
      
To complete your registration, please click the link below within 30 minutes:
${activationUrl}
      
If you did not sign up, you can ignore this email. 
`,
    });
    console.log('✅ Activation email sent successfully');
  } catch (emailError) {
    console.error('❌ Failed to send activation email:', emailError.message);
  }
}
