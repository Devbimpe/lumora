"use client"

import { useState } from "react"
import { api } from "@/app/lib/api-client"
import "../globals.css"
import "../login/login.css"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")
    
        try {
            const data = await api.post("/api/forgot-password", {
                throwHttpErrors: false,
                json: { email }
            }).json()

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

                            <div className="button">
                                <button 
                                    type="submit" 
                                    disabled={loading}
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
