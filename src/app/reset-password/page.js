"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/app/_lib/api-client"
import "../globals.css"
import "../login/login.css"
import { validatePasswordPolicy } from "@/src/app/lib/auth"

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

        if (!validatePasswordPolicy(password)) {
            setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }
    
        setLoading(true)

        try {
            const data = await api.post("/api/reset-password", {
                throwHttpErrors: true,
                json: { token, password },
            }).json()
    
            if (data.error) {
                setError(data.error)
            } else {
                setMessage(data.message)
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
                                    autoComplete="new-password"
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
                                    autoComplete="new-password"
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

