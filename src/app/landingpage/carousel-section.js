"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/button"
import { useAuth } from "@/app/components/AuthProvider"

const slides = [
  {
    title: "LUMORA",
    content:
      "A scenario-based learning platform helping you explore the social dimensions of software engineering. Learn how your development choices affect people's lives and design more inclusive, responsible systems.",
  },
  {
    title: "Why This Matters",
    content:
      "Modern software shapes everything from banking to healthcare. Yet many systems unintentionally reinforce bias or exclude users. LUMORA helps you recognize these risks and respond with thoughtful solutions.",
  },
  {
    title: "What You'll Learn",
    content:
      "• Social sustainability in software development\n• Designing for equity, accessibility, and well-being\n• Community engagement and user representation\n• Handling algorithmic bias and inclusive design challenges",
  },
  {
    title: "How It Works",
    content:
      "Learn through scenario-driven modules → Reflect on decisions and receive feedback → Apply your understanding to real development contexts.",
  },
]

export default function CarouselSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((currentSlide + 1) % slides.length)
    }, 8000) // Changed from 5000 to 8000ms (8 seconds)

    return () => clearInterval(timer)
  }, [currentSlide])

  const handleSlideChange = (newIndex) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(newIndex)
      setIsTransitioning(false)
    }, 300) // Fade out duration
  }

  const nextSlide = () => {
    handleSlideChange((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    handleSlideChange((currentSlide - 1 + slides.length) % slides.length)
  }

  const handleGetStarted = () => {
    if (user) {
      router.push("/training-module")
    } else {
      router.push("/login")
    }
  }

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 76px)' }}>
      {/* Cream Background */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: "#dbfbe7"
        }}
      />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute top-40 left-20 w-3 h-3 bg-white rounded-full"></div>
        <div className="absolute top-60 left-32 w-3 h-3 bg-white rounded-full"></div>
        <div className="absolute bottom-40 left-16 w-3 h-3 bg-white rounded-full"></div>
        <div className="absolute bottom-60 left-24 w-3 h-3 bg-white rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-200px)]">
          
          {/* Left Side - Text Content */}
          <div className="text-gray-900 space-y-6 order-1 lg:order-1">
            <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <h1
                className="font-bold leading-tight mb-6"
                style={{
                  fontSize: "clamp(2.75rem, 6.5vw, 4.5rem)",
                  letterSpacing: "-0.02em"
                }}
              >
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg sm:text-xl leading-relaxed mb-8 whitespace-pre-line">
                {slides[currentSlide].content}
              </p>
            </div>
            
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="px-10 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 text-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 group"
              style={{
                background: "linear-gradient(135deg, #15803D 0%, #14532D 100%)",
                color: "white"
              }}
            >
              <span>{loading ? "Loading..." : "Get Started"}</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* Indicator Dots */}
            <div className="flex gap-3 mt-8 items-center">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-10 bg-green-800 shadow-lg"
                      : "w-2 bg-green-700/50 hover:bg-green-700"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Decorative Image Area */}
          <div className="relative flex items-center justify-center order-2 lg:order-2 mb-8 lg:mb-0">
            {/* Decorative Circle Pattern */}
            <div className="absolute w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] border-4 md:border-8 border-green-400 rounded-full opacity-30"></div>
            
            {/* Yellow/Orange Arc */}
            <div 
              className="absolute w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-full"
              style={{
                background: "linear-gradient(135deg, transparent 50%, #FCD34D 50%)",
                clipPath: "polygon(50% 50%, 100% 0, 100% 100%)"
              }}
            />

            {/* Main Circle with Image */}
            <div className="relative w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-4 md:border-8 border-green-500" style={{ backgroundColor: "#dbfbe7" }}>
              <img
                src="http://res.cloudinary.com/du6yiw4it/image/upload/v1772417656/main-page-illustration.png"
                alt="LUMORA Platform"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Icon Badge */}
            <div className="absolute top-6 right-6 md:top-10 md:right-10 lg:top-16 lg:right-16 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center shadow-xl border-2 md:border-4 border-white"
              style={{ background: "linear-gradient(135deg, #15803D 0%, #14532D 100%)" }}
            >
              <svg className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Decorative Lines/Patterns on Right - Hidden on mobile */}
            <div className="hidden lg:block absolute right-0 top-1/4 w-32 h-32 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute h-0.5 bg-green-700 transform -rotate-45"
                  style={{ 
                    width: `${100 - i * 10}%`,
                    top: `${i * 12}px`,
                    right: 0
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
