export async function POST() {
  const response = Response.json({ success: true, message: "Logged out successfully" })

  // Clear the auth cookie
  response.headers.set("Set-Cookie", "auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax")

  return response
}
