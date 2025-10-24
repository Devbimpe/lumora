import { NextResponse } from "next/server"
import crypto from "crypto"
import { getUserByEmail, updateUser } from "../../../../db/db.js"
import { sendResetEmail } from "../../lib/reset-email.js"

export async function POST(req) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required." })
        }

        const user = await getUserByEmail(email)
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found." })
        }

        // Generate a token (48 bytes, hex-encoded) - took the reference from src/app/api/users/signup/route.js
        const token = crypto.randomBytes(48).toString("hex")
        const expires = Date.now() + 15 * 60 * 1000

        await updateUser(user.id, { resetToken: token, resetTokenExpires: expires })

        await sendResetEmail(email, token)

        return NextResponse.json({ success: true, message: "Reset link sent to your email." })

    } catch (err) {
        console.error("Forgot-password error:", err)
        return NextResponse.json({ success: false, message: "Server error. Try again." })
    }
}