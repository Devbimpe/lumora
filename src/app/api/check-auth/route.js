import { getUserByFirebaseUid } from "@db/db.js"
import jwt from "jsonwebtoken"

export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value
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
          lastLoginTime: user.previousLoginTime || null,
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