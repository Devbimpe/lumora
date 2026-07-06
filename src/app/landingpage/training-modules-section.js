"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getFaviconUrl } from "../_lib/favicons"

export default function TrainingModulesSection() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  const learningPoints = [
    "Social sustainability in software development",
    "Designing for equity, accessibility, and well-being",
    "Community engagement and user representation",
    "Handling algorithmic bias and inclusive design challenges",
  ]

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch("/api/modules")
        if (!response.ok) {
          throw new Error("Failed to fetch modules")
        }
        const data = await response.json()

        // Map API data to component format
        const formattedModules = data.map((module) => ({
          id: module.ModuleID,
          title: module.Heading,
          description: module.Subheading || "",
          image: module.faviconURL
        }))

        setModules(formattedModules)
      } catch (error) {
        console.error("Error fetching modules:", error)
        setModules([])
      } finally {
        setLoading(false)
      }
    }

    fetchModules()
  }, [])

  return (
    <section id="training-modules" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          What You'll Learn
        </h2>

        {/* Static checklist boxes matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {learningPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl p-5"
              style={{ backgroundColor: "#eafcf1" }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="#16803D" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading modules...
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No modules available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {modules.slice(0, 5).map((module) => (
              <Link key={module.id} href={`/modules/module${module.id}`} className="block h-full">
                <div
                  className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-green-100 h-full min-h-[280px] flex flex-col"
                  style={{ backgroundColor: "#eafcf1" }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 overflow-hidden bg-white border-2" style={{ borderColor: "#15803D" }}>
                    <img
                      src={module.image || "/placeholder.svg"}
                      alt={module.title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#15803D" }}>{module.title}</h3>
                  <p
                    className="text-gray-600 text-sm leading-relaxed flex-1"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {module.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}