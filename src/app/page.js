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

  // Handle hash navigation to scroll to sections
  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash
      if (hash === '#training-modules') {
        setTimeout(() => {
          const element = document.getElementById('training-modules')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else if (hash === '#course-modules') {
        setTimeout(() => {
          const element = document.getElementById('course-modules')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }, [loading, user])

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
    return <Dashboard user={user} />
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
