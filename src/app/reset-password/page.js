"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import "../globals.css"

export default function ResetPassword() {
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

    return (
        <div className="page">
            <main>
                <div className="LoginPage">
                    <h1>Reset Password</h1>
                    <div className="Maininfo">
                        <form onSubmit={handleSubmit}>
                            {error && (<div style={{ color: "red", marginBottom: "10px" }}>{error}</div>)}
                            {message && (<div style={{ color: "green", marginBottom: "10px" }}>{message}</div>)}

                            <div className="info">
                                <label htmlFor="password">New Password</label>
                                <input type="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>

                            <div className="info">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input type="password" id="confirmPassword" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                            </div>

                            <div className="button">
                                <button type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer", }}> {loading ? "Resetting..." : "Reset Password"} </button>
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
