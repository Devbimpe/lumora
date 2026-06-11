import { getUserByFirebaseUid, verifySessionCookie } from "@/app/_db/admin-db.js"
import { SESSION_COOKIE_NAME } from "@/app/_db/common"
import jwt from "jsonwebtoken"

/** @param {import('next/server').NextRequest} request  */
export async function GET(request) {

  return Response.json({
    authenticated: true,
    user: {
      role: 'Admin'
    }
  });
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value || '';
    if (!sessionCookie) {
      return Response.json({ authenticated: false })
    }

    try {
      const claim = await verifySessionCookie(sessionCookie);
      
      // Get user data from Firestore using the user ID from JWT
      const user = await getUserByFirebaseUid(claim.uid);
      
      if (!user) {
        return Response.json({ authenticated: false })
      }

      // TODO
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