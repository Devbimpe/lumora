import crypto from "node:crypto"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getUserByEmail, Timestamp, updateUser } from "@/app/_db/admin-db.js"
import { badRequestError, definePublicRoute, validateJsonBody } from "@/app/_lib/route"

export const POST = definePublicRoute(async req => {
  try {
    const { body, validationError } = await validateJsonBody(req)
    if (validationError) return validationError
    const { email } = body

    if (!email) {
      return badRequestError("Email is required.")
    }

    // Fire-and-forget: don't await. If we only wait for email delivery when
    // the user exists, response timing reveals which emails are registered.
    requestResetIfUserExists(email)

    // Always return the same message whether the email exists or not.
    // This prevents email enumeration — an attacker can't discover
    // which emails are registered by observing different responses.
    return NextResponse.json(
      { message: "If an account with that email exists, a reset link has been sent, unless the previous link has not expired." },
      { status: 200 }
    )
  } catch (err) {
    console.error("Forgot-password error:", err)
    return NextResponse.json({ error: "Server error. Try again." }, { status: 500 })
  }
});

async function requestResetIfUserExists(email) {
  const user = await getUserByEmail(email)
  if (!user) return;

  if (user.resetToken && user.resetTokenExpires.toDate() > new Date()) {
    return; // Token is still valid, don't send again
  }

  // Generate a cryptographically secure token
  const token = crypto.randomBytes(32).toString("hex")
  // Set token expiration to 30 minutes from now
  const expires = Timestamp.fromMillis(Date.now() + 30 * 60 * 1000)

  await updateUser(user.uid, {
    resetToken: token,
    resetTokenExpires: expires,
  })

  try {
    await sendResetEmail(email, token)
  } catch (emailErr) {
    console.error("Forgot-password: failed to send reset email:", emailErr.message)
  }
}

async function sendResetEmail(to, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`

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
        <p>This link expires in 30 minutes.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
