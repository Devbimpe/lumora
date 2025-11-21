"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "../globals.css"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const router = useRouter()

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

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("Login successful!")
        console.log("User role:", data.user.role)
        console.log("Redirecting to:", data.redirectUrl)
        // Redirect to home page immediately
        window.location.href = data.redirectUrl || "/"
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <main>
        <div className="LoginPage">
          <h1>Login to your account</h1>

          <div className="Maininfo">
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div
                  style={{
                    color: "red",
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#ffe6e6",
                    border: "1px solid #ff9999",
                    borderRadius: "5px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="info">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
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
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  minLength="8"
                />
                <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px", textAlign: "center" }}>
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
                  style={{
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>

              <div className="register_link">
                Don’t have an account?
                <a href="\signup">Sign up</a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
