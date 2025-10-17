import { getUserByEmail } from "@db/db.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


export async function POST(request) {
  try {
    // Get email and password from the request
    const { email, password} = await request.json()
    console.log("🔍 Login attempt for:", email)

    // Check if email and password were provided
    if (!email || !password) {
      return Response.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Look for user in database
    const user = await getUserByEmail(email)

    // Check if user exists
    if (!user) {
      console.log("❌ User not found:", email)
      return Response.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    console.log("👤 Found user:", user.username)
    
    //Check if user is Activated
    if(!user.isActivated){
       if (user.activationTokenExpires && user.activationTokenExpires.toDate() < new Date()) {
        return Response.json({ success: false, message: "Activation link expired. Please sign up again." }, { status: 403 })
      }
      return Response.json({ success: false, message: "Account not activated. Please check your email for the activation link." }, { status: 403 })
    }
    // Use bcrypt to compare password with hashed password from database
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)
      return Response.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Create login token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("✅ Login successful for:", user.username)

    // Create response with user data
    const response = Response.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        percentCompleted: user.percentModulesCompleted || 0,
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