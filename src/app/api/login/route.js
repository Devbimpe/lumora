import { getUserByFirebaseUid, updateUser } from "@db/db.js"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@db/firebase.js"
import jwt from "jsonwebtoken"


export async function POST(request) {
  try {
    // Get email and password from the request
    const { email, password} = await request.json()
    console.log("Login attempt for:", email)

    // Check if email and password were provided
    if (!email || !password) {
      return Response.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Get user data from Firestore using Firebase UID
    const user = await getUserByFirebaseUid(firebaseUser.uid)

    // Check if user exists in our Firestore
    if (!user) {
      console.log("User not found in Firestore:", email)
      return Response.json({ success: false, message: "User data not found. Please contact support." }, { status: 401 })
    }

    console.log("Found user:", user.username)
    
    // Check if user is activated (our custom activation flow)
    if(!user.isActivated){
       if (user.activationTokenExpires && user.activationTokenExpires.toDate() < new Date()) {
        return Response.json({ success: false, message: "Activation link expired. Please sign up again." }, { status: 403 })
      }
      return Response.json({ success: false, message: "Account not activated. Please check your email for the activation link." }, { status: 403 })
    }

    // Store previous login time BEFORE updating
    const currentLoginTime = new Date().toISOString()

    await updateUser(user.id, {
      previousLoginTime: user.lastLoginTime || null,
      lastLoginTime: currentLoginTime
    })

    // Create JWT token for your existing system
    const token = jwt.sign(
      {
        userId: user.id,
        firebaseUid: firebaseUser.uid,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("Login successful for:", user.username)

    const redirectUrl = user.role === 'Admin' ? '/admin' : '/'
    console.log("Login successful for:", user.username, "| Redirecting to:", redirectUrl)

    // Create response with user data
    const response = Response.json({
      success: true,
      message: "Login successful!",
      redirectUrl: redirectUrl,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        percentCompleted: user.percentModulesCompleted || 0,      },
    })

    // Set login cookie (your existing approach)
    response.headers.set("Set-Cookie", `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`)

    return response
  } catch (error) {
    console.error("Login error:", error)
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      return Response.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }
    
    if (error.code === 'auth/too-many-requests') {
      return Response.json({ success: false, message: "Too many failed login attempts. Please try again later." }, { status: 429 })
    }
    
    return Response.json({ success: false, message: "Server error occurred" }, { status: 500 })
  }
}