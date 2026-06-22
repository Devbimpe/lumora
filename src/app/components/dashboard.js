"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/app/components/AuthProvider"
import { 
  Trophy, 
  Zap, 
  Target, 
  BookOpen, 
  Award, 
  Star, 
  Crown, 
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Flame,
  PartyPopper,
  BarChart3,
  Rocket,
  BookMarked,
  MessageSquare
} from "lucide-react"

export default function Dashboard() {
  const [message, setMessage] = useState("")
  const [selectedModule, setSelectedModule] = useState("")
  const [modules, setModules] = useState([])
  const [moduleLoading, setModuleLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'
  const { user } = useAuth()
  const fetchingRef = useRef(false) // Prevent duplicate calls

  const fetchModules = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      return
    }
    
    if (!user) {
      return
    }

    fetchingRef.current = true
    setModuleLoading(true)
    
    try {
      // Batch all API calls together
      const [modulesResponse, progressResponse, contentCountsResponse] = await Promise.all([
        fetch("/api/modules"),
        fetch(`/api/progress?userId=${user.uid}`),
        fetch("/api/module-content-counts") // Get all counts in one call
      ])
      
      if (!modulesResponse.ok) {
        throw new Error("Failed to fetch modules")
      }
      const modulesData = await modulesResponse.json()
      
      let progressData = []
      if (progressResponse && progressResponse.ok) {
        progressData = await progressResponse.json()
      }
      
      let contentCounts = {}
      if (contentCountsResponse && contentCountsResponse.ok) {
        contentCounts = await contentCountsResponse.json()
      }
      
      // Create a map of module progress for quick lookup
      const progressMap = {}
      progressData.forEach(progress => {
        progressMap[progress.moduleId] = progress
      })
      
      // Map the modules from API format to dashboard format with progress
      // Only show published modules
      const publishedModules = modulesData.filter(module => module.published === true)

      const modulesWithProgress = publishedModules.map((module) => {
        const progress = progressMap[module.ModuleID] || null
        const isCompleted = progress?.isCompleted || false
        const viewedContent = progress?.viewedContent || []
        const completedContent = progress?.completedContent || []
        
        // Get content count from the batch response (pages + knowledge checks)
        const totalContent = contentCounts[module.ModuleID] || 0
        
        // Combine viewed and completed, removing duplicates
        const uniqueViewedContent = new Set([...viewedContent.map(String), ...completedContent.map(String)])
        const actualViewedCount = uniqueViewedContent.size
        
        // Use percentage from progress data if available, otherwise calculate it
        // Cap at 100% to prevent ridiculous numbers
        let progressPercentage = 0
        if (progress?.percentage !== undefined && progress?.percentage !== null) {
          progressPercentage = Math.min(Math.max(0, Math.round(progress.percentage)), 100)
        } else if (totalContent > 0) {
          progressPercentage = Math.min(Math.round((actualViewedCount / totalContent) * 100), 100)
        }
        
        return {
          id: module.ModuleID,
          title: module.Heading,
          status: isCompleted ? "completed" : viewedContent.length > 0 ? "in-progress" : "not-started",
          progress: progress,
          viewedCount: actualViewedCount,
          completedCount: completedContent.length,
          totalContent: totalContent,
          progressPercentage: progressPercentage
        }
      })
      
      setModules(modulesWithProgress)
    } catch (error) {
      console.error("Error fetching modules:", error)
      // Keep empty array on error
      setModules([])
    } finally {
      setModuleLoading(false)
      fetchingRef.current = false
    }
  }, [user])

  useEffect(() => {
    if (user && !fetchingRef.current) {
      fetchModules()
    }
  }, [user, fetchModules])

  // Handle hash navigation to scroll to course-modules section
  useEffect(() => {
    if (!moduleLoading) {
      const hash = window.location.hash
      if (hash === '#course-modules') {
        setTimeout(() => {
          const element = document.getElementById('course-modules')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300)
      }
    }
  }, [moduleLoading])

  const completedCount = modules.filter(m => m.status === "completed").length
  const notCompletedCount = modules.filter(m => m.status === "not-started").length
  const inProgressCount = modules.filter(m => m.status === "in-progress").length
  const totalModules = modules.length
  const progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
  
  // Calculate achievements
  const totalContentViewed = modules.reduce((sum, m) => sum + (m.viewedCount || 0), 0)
  const totalContentCompleted = modules.reduce((sum, m) => sum + (m.completedCount || 0), 0)
  
  // Achievement badges
  const achievements = [
    {
      id: 'first-steps',
      unlocked: inProgressCount > 0,
      Icon: Rocket,
      title: 'First Steps',
      description: 'Started your learning journey!',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'module-master',
      unlocked: completedCount >= 1,
      Icon: Star,
      title: 'Module Master',
      description: 'Completed your first module!',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'halfway-hero',
      unlocked: progressPercentage >= 50,
      Icon: Trophy,
      title: 'Halfway Hero',
      description: 'You\'re halfway there!',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'completion-champion',
      unlocked: completedCount === totalModules && totalModules > 0,
      Icon: Crown,
      title: 'Completion Champion',
      description: 'All modules completed!',
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 'content-crusher',
      unlocked: totalContentViewed >= 10,
      Icon: BookMarked,
      title: 'Content Crusher',
      description: 'Viewed 10+ content items!',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'quiz-queen',
      unlocked: totalContentCompleted >= 5,
      Icon: Target,
      title: 'Quiz Queen',
      description: 'Aced 5+ quizzes!',
      color: 'from-pink-400 to-pink-600'
    }
  ]
  
  const unlockedAchievements = achievements.filter(a => a.unlocked)

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
        // Open the default email client (Outlook, Gmail, etc.) with pre-filled email
        window.location.href = data.mailtoUrl
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
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4" style={{ backgroundColor: "#FFF8E1" }}>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <h1 
              className="text-2xl sm:text-4xl font-bold"
              style={{ color: "#16803D" }}
            >
              My Learning Progress
            </h1>
            {progressPercentage === 100 ? (
              <PartyPopper className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-bounce" />
            ) : progressPercentage >= 50 ? (
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            ) : (
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            )}
          </div>
          <p className="text-gray-700 text-sm sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2">
            <span>Track your progress and communicate with your instructor</span>
            {unlockedAchievements.length > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                <Award className="w-3 h-3" />
                {unlockedAchievements.length} Achievement{unlockedAchievements.length !== 1 ? 's' : ''} Unlocked!
              </span>
            )}
          </p>
        </div>

        {/* Overall Progress Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <h2 
              className="text-lg sm:text-2xl font-bold flex items-center gap-2"
              style={{ color: "#16803D" }}
            >
              <BarChart3 className="w-5 h-5 sm:w-7 sm:h-7" />
              Overall Progress
            </h2>
            {progressPercentage === 100 && (
              <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" />
            )}
          </div>
          
          {/* Progress Bar with Level Indicator */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1 sm:gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                Level {Math.floor(progressPercentage / 25) + 1}
              </span>
              <span className="text-xl sm:text-2xl font-bold" style={{ color: "#16803D" }}>
                {progressPercentage}%
              </span>
            </div>
            <div className="relative w-full bg-green-100 rounded-full h-4 sm:h-6 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                )}
              </div>
              {progressPercentage > 0 && progressPercentage < 100 && (
                <div 
                  className="absolute top-0 flex items-center justify-center h-full"
                  style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
                >
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
              <span>{completedCount} / {totalModules} modules completed</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{totalContentViewed} viewed</span>
              </span>
            </div>
          </div>

          {/* Status Cards with Fun Icons */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Completed Card */}
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-2 sm:p-4 border-2 border-green-300 hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md mb-1 sm:mb-0">
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-[10px] sm:text-xs mb-0.5 sm:mb-1 font-medium">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold" style={{ color: "#16803D" }}>
                    {completedCount}
                  </p>
                </div>
              </div>
            </div>

            {/* In Progress Card */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-2 sm:p-4 border-2 border-yellow-300 hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md animate-pulse mb-1 sm:mb-0">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-[10px] sm:text-xs mb-0.5 sm:mb-1 font-medium">In Progress</p>
                  <p className="text-lg sm:text-2xl font-bold" style={{ color: "#16803D" }}>
                    {inProgressCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Not Started Card */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-2 sm:p-4 border-2 border-orange-300 hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md mb-1 sm:mb-0">
                  <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-[10px] sm:text-xs mb-0.5 sm:mb-1 font-medium">Not Started</p>
                  <p className="text-lg sm:text-2xl font-bold" style={{ color: "#16803D" }}>
                    {notCompletedCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {unlockedAchievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-2 border-yellow-200">
            <h2 
              className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2"
              style={{ color: "#16803D" }}
            >
              <Award className="w-5 h-5 sm:w-7 sm:h-7" />
              Achievements Unlocked
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {unlockedAchievements.map((achievement) => {
                const IconComponent = achievement.Icon;
                return (
                  <div
                    key={achievement.id}
                    className={`bg-gradient-to-br ${achievement.color} rounded-lg p-3 sm:p-4 text-white shadow-lg transition-all border-2 border-white/20`}
                  >
                    <div className="flex justify-center mb-1 sm:mb-2">
                      <IconComponent className="w-6 h-6 sm:w-10 sm:h-10" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 text-center">{achievement.title}</h3>
                    <p className="text-[10px] sm:text-xs text-center opacity-90 hidden sm:block">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
            {achievements.filter(a => !a.unlocked).length > 0 && (
              <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4 text-center flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                {achievements.filter(a => !a.unlocked).length} more achievement{achievements.filter(a => !a.unlocked).length !== 1 ? 's' : ''} to unlock!
              </p>
            )}
          </div>
        )}

        {/* Course Modules Section */}
        <div id="course-modules" className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-3 sm:space-y-4 border-2 border-green-200">
          <h2 
            className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2"
            style={{ color: "#16803D" }}
          >
            <BookOpen className="w-5 h-5 sm:w-7 sm:h-7" />
            Course Modules
          </h2>
          
          <div className="space-y-2 sm:space-y-3">
            {moduleLoading ? (
              <div className="text-center py-6 sm:py-8 text-gray-600 text-sm">
                Loading modules...
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-600 text-sm">
                No modules available
              </div>
            ) : (
              modules.map((module) => (
              <div
                key={module.id}
                onClick={() => {
                  const lastItemId = module.progress?.lastViewedContentId;
                  const url = lastItemId
                    ? `/modules/module${module.id}?item=${lastItemId}`
                    : `/modules/module${module.id}`;
                  window.location.href = url;
                }}
                className={`cursor-pointer rounded-lg p-3 sm:p-4 border-2 hover:shadow-lg transition-all ${
                  module.status === "completed"
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
                    : module.status === "in-progress"
                    ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300"
                    : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    {module.status === "completed" ? (
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    ) : module.status === "in-progress" ? (
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md animate-pulse">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-orange-600 flex items-center justify-center bg-white">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                    )}
                    <span className="font-semibold text-gray-800 text-sm sm:text-lg truncate">{module.title}</span>
                  </div>
                  <span
                    className={`flex-shrink-0 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap ${
                      module.status === "completed"
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : module.status === "in-progress"
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                        : "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700"
                    }`}
                  >
                    {module.status === "completed" 
                      ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> <span className="hidden xs:inline">Completed</span><span className="xs:hidden">Done</span></span>
                      : module.status === "in-progress"
                      ? <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> <span className="hidden xs:inline">In Progress</span><span className="xs:hidden">Active</span></span>
                      : <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> <span className="hidden xs:inline">Not Started</span><span className="xs:hidden">New</span></span>}
                  </span>
                </div>
                
                {/* Progress Details with Fun Elements */}
                {module.status !== "not-started" && (
                  <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-[10px] sm:text-xs font-medium">
                      <span className="text-gray-700 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span className="hidden sm:inline">Content Progress</span>
                        <span className="sm:hidden">Progress</span>
                      </span>
                      <span className="text-gray-700 font-bold">
                        {module.viewedCount || 0} / {module.totalContent || 0}
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 relative ${
                          module.status === "completed"
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gradient-to-r from-yellow-400 to-yellow-600"
                        }`}
                        style={{ width: `${module.progressPercentage}%` }}
                      >
                        {module.progressPercentage > 0 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {module.completedCount > 0 && (
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span>{module.completedCount} quiz{module.completedCount !== 1 ? 'zes' : ''} aced!</span>
                        </p>
                      )}
                      <span className="text-[10px] sm:text-xs font-bold ml-auto" style={{ color: "#16803D" }}>
                        {module.progressPercentage}%
                      </span>
                    </div>
                  </div>
                )}
                {module.status === "not-started" && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Ready to start!</span>
                  </p>
                )}
              </div>
              ))
            )}
          </div>

        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <MessageSquare 
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              style={{ color: "#16803D" }}
            />
            <h2 
              className="text-lg sm:text-2xl font-bold"
              style={{ color: "#16803D", margin: 0, padding: 0, lineHeight: "1.5rem" }}
            >
              Feedback
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label
                htmlFor="module"
                className="block font-medium mb-1.5 sm:mb-2 text-gray-800 text-sm sm:text-base"
              >
                Select Module
              </label>
              <select
                id="module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm sm:text-base"
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
                className="block font-medium mb-1.5 sm:mb-2 text-gray-800 text-sm sm:text-base"
              >
                Your Question or Comment
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question or comment here..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm sm:text-base"
                rows="4"
                required
              ></textarea>
            </div>

            {submitStatus === "success" && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                Feedback submitted successfully!
              </div>
            )}
            {submitStatus === "error" && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                Failed to submit feedback. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
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
  );
}

