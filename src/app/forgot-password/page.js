"use client"

import { useState } from "react"
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
            const response = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
          
            let data
            try {
                data = await response.json()
            } catch {
                data = { success: false, message: "Invalid server response" }
            }
          
            if (data.success) {
                setMessage(data.message)
            } else {
                setError(data.message)
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
            <main>
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
