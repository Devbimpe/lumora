"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

export default function HeroCarousel() {
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
    <section className="bg-green-600 text-white py-16 relative">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
        <div className="relative">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">{slides[currentSlide].title}</h1>
            <div className="text-lg text-green-100 whitespace-pre-line leading-relaxed">
              {slides[currentSlide].content}
            </div>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">Get Started</Button>

          <div className="flex space-x-4 mt-6">
            <button onClick={prevSlide} className="bg-green-700 hover:bg-green-800 p-2 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="bg-green-700 hover:bg-green-800 p-2 rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex space-x-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-orange-400" : "bg-green-400"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <img src="/hero-illustration.png" alt="LUMORA Hero Illustration" className="max-w-full h-auto w-96" />
        </div>
      </div>
    </section>
  )
}
