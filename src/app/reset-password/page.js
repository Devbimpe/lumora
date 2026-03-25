"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import "../globals.css"
import "../login/login.css"

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing token.")
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")
    
        if (!token) {
            setError("Invalid reset token.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }
    
        setLoading(true)

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })
    
            const data = await response.json()
            if (data.success) {
                setMessage("Password reset successful! You can now log in.")
            } else {
                setError(data.message)
            }
        } catch (err) {
            console.error(err)
            setError("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="page">
            <main className="w-full">
                <div className="LoginPage">
                    <div className="login-header">
                        <h1>Reset Password</h1>
                        <p className="login-subtitle">Enter your new password below.</p>
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
                                <label htmlFor="password">New Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="info">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    required 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <div className="button">
                                <button type="submit" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>

                            <div className="register_link">
                                <a href="/login">Back to Login</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="page">
                <main className="w-full">
                    <div className="LoginPage">
                        <div className="login-header">
                            <h1>Reset Password</h1>
                            <p className="login-subtitle">Loading...</p>
                        </div>
                    </div>
                </main>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}

