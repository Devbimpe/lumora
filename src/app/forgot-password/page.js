"use client"

import { useState } from "react"
import "../globals.css"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

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
