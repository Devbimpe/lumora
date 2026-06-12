import { NextResponse } from "next/server"
import { getUserByResetToken, updateUser, updateUserAccount } from "@/app/_db/admin-db.js"
import { badRequestError, definePublicRoute, validateJsonBody } from "@/app/lib/route";

export const POST = definePublicRoute(async (req) => {
  try {
    const { body, validationError } = await validateJsonBody(req)
    if (validationError) return validationError
    const { token, password } = body

    if (!token || !password) {
      return badRequestError("Token and password are required.")
    }

    if (password.length < 6) {
      return badRequestError("Password must be at least 6 characters.")
    }

    const user = await getUserByResetToken(token)
    if (!user) {
      return badRequestError("This reset link is invalid or has expired. Please request a new one.")
    }

    // Invalidate the reset token so it cannot be reused
    await updateUser(user.uid, {
      resetToken: null,
      resetTokenExpires: null,
    })

    // Check if token is expired
    if (user.resetTokenExpires && user.resetTokenExpires.toDate() < new Date()) {
      return badRequestError("This reset link is invalid or has expired. Please request a new one.")
    }

    // Update the password in Firebase Auth
    await updateUserAccount(user.uid, { password })

    return NextResponse.json(
      { message: "Password successfully reset. You can now log in." },
      { status: 200 }
    )

  } catch (err) {
    console.error("Reset-password error:", err)

    // TODO: revamp this
    if (err.code === "auth/invalid-password") {
      return badRequestError("Password does not meet requirements.")
    }

    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
})
