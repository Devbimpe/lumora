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
    }, 8000)

    return () => clearInterval(timer)
  }, [currentSlide])

  const handleSlideChange = (newIndex) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(newIndex)
      setIsTransitioning(false)
    }, 300)
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
    <section className="relative overflow-hidden bg-white">
      {/* Soft mint background wash, matching Figma hero */}
      <div className="absolute inset-0" style={{ background: "#eafcf1" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left Side - Text Content */}
          <div className="text-gray-900 order-1 lg:order-1">
            <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <h1
                className="font-bold leading-tight mb-4"
                style={{
                  fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
                  letterSpacing: "-0.02em",
                  color: "#15803D"
                }}
              >
                {slides[currentSlide].title}
              </h1>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-gray-600 whitespace-pre-line max-w-md">
                {slides[currentSlide].content}
              </p>
            </div>

            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="px-7 py-3 rounded-full font-semibold shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-300 text-base active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 group"
              style={{ backgroundColor: "#15803D", color: "white" }}
            >
              <span>{loading ? "Loading..." : "Get Started"}</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* Indicator Dots */}
            <div className="flex gap-1.5 mt-6 items-center">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-5 bg-green-700"
                      : "w-1.5 bg-green-200 hover:bg-green-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative flex items-center justify-center order-2 lg:order-2">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/working1.jpg"
                alt="LUMORA Platform"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}