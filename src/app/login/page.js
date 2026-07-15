"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FirebaseError } from "firebase/app"
import "../globals.css"
import "./login.css"
import { useAuth } from "@/app/components/AuthProvider"
import { api } from "@/app/_lib/api-client"
import { isHTTPError } from "ky"
import { mapAuthError, clientAuthErrorMap, validatePasswordPolicy } from "@/app/_lib/auth-helper"

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

  const { user: currentUser, loading: checkingAuth, signIn, reload } = useAuth();
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")

  // Check if user is already authenticated and redirect if so
  function checkRedirect() {
    if (!checkingAuth && currentUser && (!currentUser.account.email || currentUser.account.emailVerified)) {
      console.log("User is authenticated, redirecting...");
      if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("/login")) {
        router.push(callbackUrl);
      } else if(currentUser.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }

  useEffect(() => {
    checkRedirect()
  }, [router, checkingAuth, currentUser]);

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

    if (!validatePasswordPolicy(formData.password)) {
      setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.")
      setLoading(false)
      return
    }

    try {
      console.log("🚀 Attempting login...")
      await signIn(formData.email, formData.password)

      const { status } = await api.post('/api/email-verification').json()
      if (status === 'verified') {
        checkRedirect();
      } else if (status === 'valid_token') {
        setError('Account not activated. Please check your email for the activation link. You can resend it after the current link expires.')
      } else if (status === 'sent') {
        setError('Account not activated. We’ve sent you an activation link to complete your registration.')
      } else {
        console.warn('Unexpected email verification status:', status)
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        setError(mapAuthError(error, clientAuthErrorMap))
      } else if (isHTTPError(error) && typeof error.data === 'object' && error.data?.error) {
        setError(error.data.error)
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

              <div className="button">
                <button
                  type="submit"
                  id="LoginButton"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>

              <div className="login-footer register_link">
                <span>Don't have an account? <a href="/signup">Sign up</a></span>
                <a href="/forgot-password">Forgot password</a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
