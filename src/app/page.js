"use client"
import { useEffect } from "react"
import CarouselSection from "./landingpage/carousel-section"
import WhyThisMattersSection from "./landingpage/why-this-matters-section"
import HowItWorksSection from "./landingpage/how-it-works-section"
import TrainingModulesSection from "./landingpage/training-modules-section"
import WhoIsThisForSection from "./landingpage/who-is-this-for-section"
import FAQSection from "./landingpage/faq-section"
import Dashboard from "./components/dashboard" 
import { useAuth } from "@/app/components/AuthProvider"

export default function HomePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
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
    <div id="top" className="min-h-screen bg-gray-50">
      <CarouselSection />
      <WhyThisMattersSection />
      <TrainingModulesSection />
      <HowItWorksSection />
      <WhoIsThisForSection />
      <FAQSection />
    </div>
  )
}
