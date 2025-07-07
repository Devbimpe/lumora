import pool from "../../../../db/db.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const JWT_SECRET = "lumora-secret-key-2024"

export async function POST(request) {
  try {
    // Get email and password from the request
    const { email, password } = await request.json()
    console.log("🔍 Login attempt for:", email)

    // Check if email and password were provided
    if (!email || !password) {
      return Response.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Look for user in database
    const [users] = await pool.query("SELECT * FROM Users WHERE Email = ?", [email])

    // Check if user exists
    if (users.length === 0) {
      console.log("❌ User not found:", email)
      return Response.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    const user = users[0]
    console.log("👤 Found user:", user.Username)

    // Use bcrypt to compare password with hashed password from database
    const isPasswordValid = await bcrypt.compare(password, user.Password)

    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)
      return Response.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Create login token
    const token = jwt.sign(
      {
        userId: user.UserID,
        email: user.Email,
        username: user.Username,
        role: user.Role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("✅ Login successful for:", user.Username)

    // Create response with user data
    const response = Response.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        role: user.Role,
        percentCompleted: user.PercentModulesCompleted,
      },
    })

    // Set login cookie
    response.headers.set("Set-Cookie", `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`)

    return response
  } catch (error) {
    console.error("💥 Login error:", error)
    return Response.json({ success: false, message: "Server error occurred" }, { status: 500 })
  }
}