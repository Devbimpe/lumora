"use client";
import { useEffect, useState } from "react";
import db from "@/db/db";

export default function ModuleProgressPage() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await db.getAllModuleProgressWithUsers();
        setProgress(data);
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const filteredProgress = progress.filter((p) => {
    if (filter === "completed") return p.completed;
    if (filter === "in-progress") return !p.completed && p.progress > 0;
    if (filter === "not-started") return p.progress === 0;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading module progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Module Progress Dashboard</h1>
          <p className="text-gray-600">Track student progress across all modules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{progress.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {progress.filter((p) => p.completed).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {progress.filter((p) => !p.completed && p.progress > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
            <p className="text-gray-500 text-sm font-medium">Not Started</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {progress.filter((p) => p.progress === 0).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Students" },
              { value: "completed", label: "Completed" },
              { value: "in-progress", label: "In Progress" },
              { value: "not-started", label: "Not Started" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgress.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {p.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{p.fullName}</h3>
                      <p className="text-sm text-gray-500">@{p.userName}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Module {p.moduleId}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round(p.progress * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          p.completed
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : p.progress > 0
                            ? "bg-gradient-to-r from-blue-400 to-indigo-600"
                            : "bg-gray-300"
                        }`}
                        style={{ width: `${Math.round(p.progress * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.completed
                          ? "bg-green-100 text-green-800"
                          : p.progress > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {p.completed ? "✓ Completed" : p.progress > 0 ? "In Progress" : "Not Started"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No progress data found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}