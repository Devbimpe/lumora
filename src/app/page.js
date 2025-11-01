"use client"
import { useState, useEffect } from "react"
import CarouselSection from "./components/carousel-section"
import WhyThisMattersSection from "./components/why-this-matters-section"
import HowItWorksSection from "./components/how-it-works-section"
import TrainingModulesSection from "./components/training-modules-section"
import WhoIsThisForSection from "./components/who-is-this-for-section"
import Dashboard from "./components/dashboard" 

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CarouselSection />
      <WhyThisMattersSection />
      <TrainingModulesSection />
      <HowItWorksSection />
      <WhoIsThisForSection /> 
    </div>
  )
}
