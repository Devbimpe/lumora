"use client"

import { useState, useEffect } from "react"

export default function Dashboard() {
  const [message, setMessage] = useState("")
  const [selectedModule, setSelectedModule] = useState("")
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'
  const [user, setUser] = useState(null)

  // Fetch modules from Firebase and get current user
  useEffect(() => {
    fetchModules()
    checkAuthStatus()
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
    }
  }

  const fetchModules = async () => {
    try {
      const response = await fetch("/api/modules")
      if (!response.ok) {
        throw new Error("Failed to fetch modules")
      }
      const data = await response.json()
      
      // Map the modules from API format to dashboard format
      // Set all modules as "not-started" by default
      const formattedModules = data.map((module) => ({
        id: module.ModuleID,
        title: module.Heading,
        status: "not-started" // Default to not completed
      }))
      
      setModules(formattedModules)
    } catch (error) {
      console.error("Error fetching modules:", error)
      // Keep empty array on error
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  const completedCount = modules.filter(m => m.status === "completed").length
  const notCompletedCount = modules.filter(m => m.status === "not-started").length
  const totalModules = modules.length
  const progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isFormValid || !user) {
      return
    }

    setSubmitting(true)
    setSubmitStatus(null)

    try {
      // Convert "general" to "General", otherwise use the module ID as-is
      const feedbackType = selectedModule === "general" ? "General" : selectedModule
      
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          type: feedbackType
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus("success")
        setMessage("")
        setSelectedModule("")
        // Clear status message after 3 seconds
        setTimeout(() => {
          setSubmitStatus(null)
        }, 3000)
      } else {
        setSubmitStatus("error")
        console.error("Failed to submit feedback:", data.message)
      }
    } catch (error) {
      setSubmitStatus("error")
      console.error("Error submitting feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = selectedModule !== "" && message.trim() !== ""

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "#FFF8E1" }}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div>
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: "#16803D" }}
          >
            My Learning Progress
          </h1>
          <p className="text-gray-700 text-lg">
            Track your progress and communicate with your instructor
          </p>
        </div>

        {/* Overall Progress Section */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: "#16803D" }}
          >
            Overall Progress
          </h2>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="font-medium" style={{ color: "#16803D" }}>{progressPercentage}%</span>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Completed Card */}
            <div className="bg-orange-100 rounded-lg p-4 flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 text-sm mb-1">Completed</p>
                <p className="text-xl font-semibold" style={{ color: "#16803D" }}>
                  {completedCount} modules
                </p>
              </div>
            </div>

            {/* Not Completed Card */}
            <div className="bg-green-100 rounded-lg p-4 flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-green-600 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-green-600"></div>
              </div>
              <div>
                <p className="text-gray-700 text-sm mb-1">Not Completed</p>
                <p className="text-xl font-semibold" style={{ color: "#16803D" }}>
                  {notCompletedCount} modules
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Modules Section */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: "#16803D" }}
          >
            Course Modules
          </h2>
          
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-600">
                Loading modules...
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No modules available
              </div>
            ) : (
              modules.map((module) => (
              <div
                key={module.id}
                className="bg-green-50 rounded-lg p-4 flex items-center justify-between border border-green-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {module.status === "completed" ? (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-green-600"></div>
                  )}
                  <span className="font-medium text-gray-800">{module.title}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    module.status === "completed"
                      ? "bg-orange-500 text-white"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {module.status === "completed" ? "Completed" : "Not Started"}
                </span>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <svg
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "#16803D", marginTop: "-2px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h2 
              className="text-2xl font-bold"
              style={{ color: "#16803D", margin: 0, padding: 0, lineHeight: "1.5rem" }}
            >
              Feedback
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="module"
                className="block font-medium mb-2 text-gray-800"
              >
                Select Module
              </label>
              <select
                id="module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                required
              >
                <option value="">-- Select a module --</option>
                <option value="general">General</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block font-medium mb-2 text-gray-800"
              >
                Your Question or Comment
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question or comment here..."
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="6"
                required
              ></textarea>
            </div>

            {submitStatus === "success" && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                Feedback submitted successfully!
              </div>
            )}
            {submitStatus === "error" && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                Failed to submit feedback. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                isFormValid && !submitting
                  ? "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

