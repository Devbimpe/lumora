import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import { getAllUsers, updateUser } from "../../../../db/db.js"
import { adminAuth } from "../../../../firebaseAdmin.js"

export async function POST(req) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ success: false, message: "Token and password required" })
  }

  const users = await getAllUsers()
  const user = users.find(u => u.resetToken === token && u.resetTokenExpires > Date.now())

  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" })
  }

  try {
    await adminAuth.updateUser(user.firebaseUid, { password })

    const hashedPassword = await bcrypt.hash(password, 10)

    await updateUser(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null
    })

    return NextResponse.json({ success: true, message: "Password successfully reset" })
  } catch (err) {
    console.error("Reset password error:", err)
    return NextResponse.json({ success: false, message: "Failed to reset password" })
  }
}
