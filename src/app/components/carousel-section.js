"use client"

import { useState, useEffect } from "react"
import { Button } from "./button"

const slides = [
  {
    title: "What is LUMORA?",
    content:
      "LUMORA is a scenario-based learning platform designed to help you explore the social dimensions of software engineering. Through immersive ethical scenarios and critical decision-making exercises, you will learn how your development choices affect people's lives, and how to design more inclusive, responsible, and sustainable systems.",
  },
  {
    title: "Why This Matters",
    content:
      "Modern software shapes everything, from how we bank to how we access healthcare and education. Yet, many systems unintentionally reinforce bias, exclude marginalized users, or put privacy at risk. LUMORA helps developers recognize these risks and respond with thoughtful, socially aware solutions.",
  },
  {
    title: "What You'll Learn",
    content:
      "• What social sustainability means in the context of software development\n• How to design for equity, accessibility, and well-being\n• The role of community engagement and user representation in ethical tech\n• How to handle real-world dilemmas like algorithmic bias, surveillance concerns, and inclusive design trade-offs",
  },
  {
    title: "How It Works",
    content:
      "1. Learn – Engage with short, scenario-driven modules based on real-world software dilemmas.\n\n2. Reflect – Choose responses, justify your decisions, and receive constructive feedback.\n\n3. Apply – Carry your learning into real development contexts with a deeper understanding of ethical and social implications.",
  },
]

export default function CarouselSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="text-white py-16 relative" style={{ backgroundColor: "#69977A" }}>
      {/* Navigation Buttons - Positioned in the middle of the content */}
      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10 bg-green-700 hover:bg-green-800 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10 bg-green-700 hover:bg-green-800 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
        <div className="relative">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">{slides[currentSlide].title}</h1>
            <div className="text-lg text-green-100 whitespace-pre-line leading-relaxed">
              {slides[currentSlide].content}
            </div>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded">Get Started</Button>

          {/* Centered Indicator Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-orange-400 shadow-lg scale-110"
                    : "bg-white bg-opacity-60 hover:bg-opacity-80"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <img src="/main-page-illustration.png" alt="LUMORA Hero Illustration" className="max-w-full h-auto w-96" />
        </div>
      </div>
    </section>
  )
}
