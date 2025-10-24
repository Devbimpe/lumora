import { getUserByFirebaseUid } from "@db/db.js"
import jwt from "jsonwebtoken"


export async function GET(request) {
  try {
    // Get the auth token from cookies
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader) {
      return Response.json({ authenticated: false })
    }

    // Extract the auth-token from cookies
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=")
      acc[key] = value
      return acc
    }, {})

    const token = cookies["auth-token"]
    if (!token) {
      return Response.json({ authenticated: false })
    }

    try {
      // Verify the JWT token (your existing approach)
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Get user data from Firestore using the user ID from JWT
      const user = await getUserByFirebaseUid(decoded.firebaseUid || decoded.userId);
      
      if (!user) {
        return Response.json({ authenticated: false })
      }

      return Response.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          percentCompleted: user.percentModulesCompleted || 0,
        }
      })
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return Response.json({ authenticated: false })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return Response.json({ authenticated: false })
  }
}