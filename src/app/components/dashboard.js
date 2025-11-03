"use client"

import { useState } from "react"

export default function Dashboard() {
  const [message, setMessage] = useState("")

  // Dummy data for modules
  const modules = [
    { id: 1, title: "Introduction to React", status: "completed" },
    { id: 2, title: "Understanding Components", status: "completed" },
    { id: 3, title: "State Management", status: "completed" },
    { id: 4, title: "Hooks Deep Dive", status: "not-started" },
    { id: 5, title: "React Router", status: "not-started" },
    { id: 6, title: "Performance Optimization", status: "not-started" },
    { id: 7, title: "Testing React Apps", status: "not-started" },
    { id: 8, title: "Advanced Patterns", status: "not-started" },
  ]

  const completedCount = modules.filter(m => m.status === "completed").length
  const notCompletedCount = modules.filter(m => m.status === "not-started").length
  const totalModules = modules.length
  const progressPercentage = Math.round((completedCount / totalModules) * 100)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Message sent:", message)
    setMessage("")
    alert("Message sent successfully!")
  }

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
            {modules.map((module) => (
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
            ))}
          </div>
        </div>

        {/* Contact Admin Section */}
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
              Contact Admin
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

