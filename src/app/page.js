"use client"
import { useState, useEffect } from "react"
import CarouselSection from "./landingpage/carousel-section"
import WhyThisMattersSection from "./landingpage/why-this-matters-section"
import HowItWorksSection from "./landingpage/how-it-works-section"
import TrainingModulesSection from "./landingpage/training-modules-section"
import WhoIsThisForSection from "./landingpage/who-is-this-for-section"
import FAQSection from "./landingpage/faq-section"
import Dashboard from "./components/dashboard" 

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    
    // Handle scrolling to FAQ section when navigating with hash
    if (window.location.hash === '#faq') {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        const faqSection = document.getElementById('faq');
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
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
    return <Dashboard user={user} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CarouselSection />
      <WhyThisMattersSection />
      <TrainingModulesSection />
      <HowItWorksSection />
      <WhoIsThisForSection />
      <FAQSection />
    </div>
  )
}
