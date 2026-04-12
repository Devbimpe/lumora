import { NextResponse } from "next/server"
import crypto from "crypto"
import admin from "firebase-admin"
import { getUserByEmail, updateUser } from "../../../../db/admin-db.js"
import { sendResetEmail } from "../../lib/reset-email.js"

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 })
    }

    // Always return the same message whether the email exists or not.
    // This prevents email enumeration — an attacker using curl can't discover
    // which emails are registered by observing different responses.
    const SAFE_RESPONSE = NextResponse.json(
      { success: true, message: "If an account with that email exists, a reset link has been sent." },
      { status: 200 }
    )

    const user = await getUserByEmail(email)
    if (!user) {
      // Silently succeed — do NOT reveal that this email does not exist
      return SAFE_RESPONSE
    }

    // Generate a cryptographically secure token (48 bytes, hex-encoded)
    const token = crypto.randomBytes(48).toString("hex")
    // Store expiry as Firestore Timestamp for consistency with the rest of the codebase
    const expires = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 15 * 60 * 1000)
    )

    // Write the reset token + expiry into the user's Firestore doc via Admin SDK (privileged)
    await updateUser(user.id, {
      resetToken: token,
      resetTokenExpires: expires,
    })

    // Send the reset email — if email delivery fails, still return the safe response
    // so we don't leak whether an account exists or whether email was delivered
    try {
      await sendResetEmail(email, token)
    } catch (emailErr) {
      console.error("Forgot-password: failed to send reset email:", emailErr.message)
    }

    return SAFE_RESPONSE

  } catch (err) {
    console.error("Forgot-password error:", err)
    return NextResponse.json({ success: false, message: "Server error. Try again." }, { status: 500 })
  }
}