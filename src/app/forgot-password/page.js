"use client"

import { useRef, useState } from "react"
import { api } from "@/app/_lib/api-client"
import "../globals.css"
import "../login/login.css"
import { Turnstile } from "@/app/components/Turnstile"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [token, setToken] = useState(null);
    const turnstile = useRef()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!token) {
          setError("Please complete the security check")
          setMessage("")
          return
        }

        setLoading(true)
        setError("")
        setMessage("")
    
        try {
            const data = await api.post("/api/forgot-password", {
                throwHttpErrors: false,
                json: { email, token }
            }).json()
            setToken(null);
            turnstile.current?.reset();

            if (data.error) {
                setError(data.message)
            } else {
                setMessage(data.message)
            }
        } catch (err) {
            console.error("Network error:", err)
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }      
    }

    return (
        <div className="page">
            <main className="w-full">
                <div className="LoginPage">
                    <div className="login-header">
                        <h1>Forgot Password</h1>
                        <p className="login-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
                    </div>
                    <div className="Maininfo">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="success-message">
                                    {message}
                                </div>
                            )}

                            <div className="info">
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email"
                                    autoComplete="username"
                                    placeholder="Enter your email"
                                    required 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    disabled={loading}
                                />
                            </div>

                            <Turnstile
                              ref={turnstile}
                              className="mb-4"
                              config={{
                                action: 'forgot-password',
                                callback: (newToken) => setToken(newToken),
                                'expired-callback': () => {
                                  setToken(null);
                                  turnstile.current?.reset();
                                },
                              }}
                            />

                            <div className="button">
                                <button 
                                    type="submit" 
                                    disabled={loading || !token}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </div>

                            <div className="register_link">
                                Remember your password? <a href="/login">Back to Login</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
