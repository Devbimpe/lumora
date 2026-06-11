"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FirebaseError } from "firebase/app"
import "../globals.css"
import "./login.css"
import { useAuth } from "@/app/components/AuthProvider"

export default function Login() {
  return (
    <Suspense fallback={
      <div className="page">
        <main className="w-full">
          <div className="LoginPage">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
              <span className="text-gray-600 text-lg font-medium">Loading...</span>
            </div>
          </div>
        </main>
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const { user: currentUser, loading: checkingAuth, signIn } = useAuth();

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")

  // Check if user is already authenticated and redirect if so
  useEffect(() => {
    if (!checkingAuth && currentUser) {
      console.log("User is authenticated, redirecting...");
      if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("/login")) {
        router.push(callbackUrl);
      } else if(currentUser.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [router, checkingAuth, currentUser]);



  // Proper password validation for EVERYONE
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number"
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character"
    }
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate password for EVERYONE - no exceptions
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      console.log("🚀 Attempting login...")
      await signIn(formData.email, formData.password, formData.rememberMe)
    } catch (error) {
      if (error instanceof FirebaseError) {
        setError(error.message) // TODO
      } else {
        console.error("Network error:", error)
        setError("Network error. Please check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }


  // Show checking auth state
  if (checkingAuth) {
    return (
      <div className="page">
        <main className="w-full">
          <div className="LoginPage">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
              <span className="text-gray-600 text-lg font-medium">Checking authentication...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="page">
      <main className="w-full">
        <div className="LoginPage">
          <div className="login-header">
            <h1>Login to your account</h1>
            <p className="login-subtitle">Welcome back! Please enter your credentials to continue.</p>
          </div>

          <div className="Maininfo">
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {/* Display login error message */}
                  {error}
                </div>
              )}

              <div className="info">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="username"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="info">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  minLength="8"
                />
                <small>
                  Password must be 8+ characters with uppercase, lowercase, number, and special character
                </small>
              </div>

              <div className="remember_forget">
                <label>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    style={{ marginRight: "5px" }}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="/forgot-password">Forgot password?</a>
              </div>

              <div className="button">
                <button
                  type="submit"
                  id="LoginButton"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>

              <div className="register_link">
                Don't have an account? <a href="/signup">Sign up</a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
