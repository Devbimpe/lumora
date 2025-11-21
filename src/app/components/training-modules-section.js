"use client"

import { useState, useEffect } from "react"

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
          image: `/M${module.ModuleID}.jpg`, // Map module ID to image path
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
    <section id="training-modules" className="bg-green-100 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "3rem", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {firstRow.map((module) => (
                <div
                  key={module.id}
                  className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform"
                >
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img src={module.image || "/placeholder.svg"} alt={module.title} className="w-10 h-10 object-cover" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700 mb-2">{module.title}</h3>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                </div>
              ))}
            </div>

            {secondRow.length > 0 && (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  {secondRow.map((module) => (
                    <div
                      key={module.id} 
                      className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform"
                    >
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src={module.image || "/placeholder.svg"} alt={module.title} className="w-10 h-10 object-cover" />
                      </div>
                      <h3 className="text-lg font-bold text-green-700 mb-2">{module.title}</h3>
                      <p className="text-gray-600 text-sm">{module.description}</p>
                    </div>
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
