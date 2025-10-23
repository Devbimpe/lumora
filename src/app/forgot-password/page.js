"use client"

import { useState } from "react"
import "../globals.css"

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
        }      
    }

    return (
        <div className="page">
            <main>
                <div className="LoginPage">
                    <h1>Forgot Password</h1>
                    <div className="Maininfo">
                        <form onSubmit={handleSubmit}>
                            {error && (<div style={{ color: "red", marginBottom: "10px" }}>{error}</div>)}
                            {message && (<div style={{ color: "green", marginBottom: "10px" }}>{message}</div>)}

                            <div className="info">
                                <label htmlFor="email">Enter your email</label>
                                <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}/>
                            </div>

                            <div className="button">
                                <button type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer", }}> {loading ? "Sending..." : "Send Reset Link"} </button>
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
