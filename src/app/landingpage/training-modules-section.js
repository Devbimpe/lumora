"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getFaviconUrl } from "../lib/favicons"

export default function TrainingModulesSection() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

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
          image: getFaviconUrl(module.ModuleID),
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

  const firstRow = modules.slice(0, 3) 
  const secondRow = modules.slice(3, 5) 

  return (
    <section id="training-modules" className="py-20 relative overflow-hidden" style={{ 
      backgroundColor: "#dbfbe9"
    }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <h2
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          What will you Learn?
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading modules...
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No modules available
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
              {firstRow.map((module) => (
                <Link key={module.id} href={`/modules/module${module.id}`} className="block">
                  <div className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 transform border border-green-100">
                    <div className="w-20 h-20 border-2 border-green-700 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden bg-white">
                      <img 
                        src={module.image || "/placeholder.svg"} 
                        alt={module.title} 
                        className="w-full h-full object-cover rounded-full" 
                      />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-3">{module.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{module.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            {secondRow.length > 0 && (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                  {secondRow.map((module) => (
                    <Link key={module.id} href={`/modules/module${module.id}`} className="block">
                      <div className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 transform border border-green-100">
                        <div className="w-20 h-20 border-2 border-green-700 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden bg-white">
                          <img 
                            src={module.image || "/placeholder.svg"} 
                            alt={module.title} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        </div>
                        <h3 className="text-xl font-bold text-green-700 mb-3">{module.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{module.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
