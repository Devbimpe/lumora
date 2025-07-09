"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in when component loads
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/check-auth")
      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      setUser(null)
      window.location.href = "/" // Redirect to home
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header>
      <nav className="topnav">
        <div>
          <Link href={{ pathname: "/" }}>
            <Image src="/Lumoralogo.jpeg" alt="LumoraLogo" width={"200"} height={"80"} />
          </Link>
        </div>

        <div className="right">
          <Link href={{ pathname: "/" }} className="about">
            About
          </Link>
          <Link href="/training-module" className="trainingmodule">
            Training Module
          </Link>

          {loading ? (
            <span className="login">Loading...</span>
          ) : user ? (
            // Show user dropdown and logout when logged in
            <div className="user-section">
              <span className="user-welcome">Hi, {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            // Show login link when not logged in
            <Link href={{ pathname: "login" }} className="login">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
