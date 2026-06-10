import { NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getUserByResetToken, updateUser } from "../../../../db/admin-db.js"

const auth = getAuth(); // TODO: move to admin-db.js

export async function POST(req) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      )
    }

    // Look up the user by reset token only — no full user scan.
    // getUserByResetToken checks that the token matches AND has not expired.
    const user = await getUserByResetToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Update the password in Firebase Auth via Admin SDK (privileged — cannot be spoofed by curl)
    await auth.updateUser(user.firebaseUid, { password })

    // Invalidate the reset token so it cannot be reused
    await updateUser(user.id, {
      resetToken: null,
      resetTokenExpires: null,
    })

    return NextResponse.json(
      { success: true, message: "Password successfully reset. You can now log in." },
      { status: 200 }
    )

  } catch (err) {
    console.error("Reset-password error:", err)

    if (err.code === "auth/invalid-password") {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
