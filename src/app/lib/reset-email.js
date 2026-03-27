import nodemailer from "nodemailer"
import { getAppOrigin } from "@/src/app/lib/app-origin.js";

export async function sendResetEmail(to, token) {
  // Created transporter using Gmail SMTP - took the reference from src/app/api/users/signup/route.js
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const origin = getAppOrigin();
  const resetLink = new URL(`/reset-password?token=${token}`, origin).toString();

  // Took the reference from src/app/api/users/signup/route.js
  const mailOptions = {
    from: `"Lumora Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Lumora Account Password",
    html: `
      <div style = "font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your Lumora account password.</p>
        <p>Click below to reset it:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>This link expires in 15 minutes.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}