"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { api } from "@/app/_lib/api-client";


export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const {user, loading: authLoading } = useAuth();

  useEffect(() => {
    let isMounted = true;

    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchFeedback = async () => {
      try {
        const data = await api.get('/api/admin/feedback').json();

        if (isMounted) {
          setFeedback(data.feedback || []);
        }
      } 
      catch (err) {
        if (isMounted) {
          console.error("Error fetching feedback:", err);
        }
      } 
      finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeedback();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  // Get  feedback types
  const feedbackTypes = [...new Set(feedback.map((f) => f.displayType))];

  const filteredFeedback = feedback.filter((f) => {
    if (filter === "all") return true;
    return f.displayType === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Feedback Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Review and manage user feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Feedback</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 sm:mt-3">{feedback.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">Feedback Types</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 sm:mt-3">{feedbackTypes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500 sm:col-span-2 lg:col-span-1">
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">Unique Users</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 sm:mt-3">
            {new Set(feedback.map((f) => f.userId)).size}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
              filter === "all"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {feedbackTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                filter === type
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filteredFeedback.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0 shadow-md">
                      {f.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 min-w-0">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{f.fullName}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{f.email}</p>
                    </div>
                  </div>

                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full self-start">
                    {f.displayType}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-400">
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">{f.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12 sm:h-16 sm:w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">No feedback found for this filter.</p>
        </div>
      )}
    </div>
  );
}
