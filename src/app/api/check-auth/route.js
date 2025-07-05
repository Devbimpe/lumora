import jwt from "jsonwebtoken"

const JWT_SECRET = "lumora-secret-key-2024"

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

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET)
    return Response.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      },
    })
  } catch (error) {
    return Response.json({ authenticated: false })
  }
}
