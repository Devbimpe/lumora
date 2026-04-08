"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { logoutAndBroadcast } from "../lib/auth"

export function Header() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hide header on module pages and admin pages
  const isModulePage = pathname?.startsWith('/modules/')
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    checkAuthStatus()
    
    function refreshAuth() {
      checkAuthStatus()
    }
  
    window.addEventListener("auth-changed", refreshAuth)
  
    return () => window.removeEventListener("auth-changed", refreshAuth)
  }, [])

  // Extra safety: refresh auth when route changes (prevents stale UI if an event is missed)
  useEffect(() => {
    checkAuthStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/check-auth")
      const data = await response.json()
      if (data.authenticated) {
        setUser(data.user)
        console.log("User loaded in header:", data.user.username, "| Role:", data.user.role)
      } else {
        setUser(null)  
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)  
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutAndBroadcast()
      setUser(null)
      window.location.href = "/" 
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Don't render header on module pages or admin pages
  if (isModulePage || isAdminPage) {
    return null
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image 
              src="http://res.cloudinary.com/du6yiw4it/image/upload/v1772421438/Lumoralogo.jpg" 
              alt="LumoraLogo" 
              width={180} 
              height={72} 
              className="h-10 sm:h-14 w-auto" 
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Home
            </Link>

            {user && ( 
              <Link 
                href="/training-module" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Training Modules
              </Link>
            )}

            {user && ( 
              <Link 
                href="/user-progress" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Module Progress
              </Link>
            )}

            {user && user.role === "Admin" && (
              <Link 
                href="/admin" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Admin Dashboard
              </Link>
            )}

            {loading ? (
              <span className="text-gray-400 text-sm">Loading...</span>
            ) : user ? (
              <div className="flex items-center gap-3 lg:gap-4">
                <Link 
                  href="/user-profile" 
                  className="text-gray-700 font-medium text-sm lg:text-base hover:text-green-600 transition-colors"
                >
                  My Account
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm lg:text-base"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
            <Link 
              href="/" 
              className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {user && ( 
              <Link 
                href="/training-module" 
                className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Training Modules
              </Link>
            )}

            {user && ( 
              <Link 
                href="/user-progress" 
                className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Module Progress
              </Link>
            )}

            {user && user.role === "Admin" && (
              <Link 
                href="/admin" 
                className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            {loading ? (
              <span className="text-gray-400 text-sm py-2 block">Loading...</span>
            ) : user ? (
              <div className="space-y-3 pt-2">
                <Link 
                  href="/user-profile" 
                  className="text-gray-700 font-medium block hover:text-green-600 transition-colors"
                >
                  Hi, {user.username}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="block w-full px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}