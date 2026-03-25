"use client";

import { useState, useEffect } from "react";

export default function UserProgressPage() {
  const [modules, setModules] = useState([]); // All modules
  const [moduleProgress, setModuleProgress] = useState([]); //Modules with progress made
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null); // module that opens the popup

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/check-auth");
      const data = await response.json();
      if (data.authenticated) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules");
      const data = await res.json();
      setModules(data);
      console.log("Modules", data)
      return data;
    } catch (err) {
      console.error("Failed to fetch modules:", err);
      return [];
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`/api/progress?userId=${user?.id}`);
      const data = await response.json();
      if(Array.isArray(data)) {
        setModuleProgress(data);
        console.log("User-Progress", data);
      }
    } catch (error) {
      console.error("Progress fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
  if (user?.id) {
    fetchModules()
    fetchUserProgress();
  }
}, [user?.id]);

const modulesMap = modules.reduce((acc, mod) => {
  acc[mod.ModuleID] = mod;
  return acc;
}, {});

// Add heading to module progress
const enrichedProgress = moduleProgress.map((p) => ({
  ...p,
  Heading: modulesMap[p.moduleId]?.Heading ?? "Untitled Module",
}));

  const filteredModules = (activeFilter ? enrichedProgress : modules).filter((mod) => {
  const matchesSearch = (mod.Heading?.toLowerCase() ?? "")
  .includes(searchQuery.toLowerCase());

  const matchesFilter =
    activeFilter === null ||
    (activeFilter === "complete" && mod.isCompleted) ||
    (activeFilter === "in_progress" && !mod.isCompleted && mod.percentage > 0) ||
    (activeFilter === "not_started" && mod.percentage === 0);

  return matchesSearch && matchesFilter;
});

  // Status badge helper
  const statusConfig = {
    complete: {
      label: "Complete",
      badge: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    },
    in_progress: {
      label: "In Progress",
      badge: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    },
    not_started: {
      label: "Not Started",
      badge: "bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
    },
  };

  const getStatus = (mod) => {
  if (mod.isCompleted) return statusConfig.complete;
  if (mod.percentage > 0) return statusConfig.in_progress;
  return statusConfig.not_started;
};

  // Filter component
  const filters = [
    { key: "complete", label: "Complete" },
    { key: "in_progress", label: "In Progress" },
    { key: "not_started", label: "Not Started" },
  ];

  const filterActive = "bg-green-600 text-white border-green-600 shadow-sm";
  const filterInactive = "bg-white text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-600";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Page heading */}
        <h1 className="text-3xl font-bold text-slate-800 mb-1">My Modules</h1>
        <p className="text-slate-500 mb-8">
          Track and continue your learning progress.
        </p>

        {/* Search bar */}
        <div className="relative mb-5">
          <svg
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"
            />
          </svg>

          <input
            type="text"
            placeholder="Search modules…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-7">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() =>
                setActiveFilter((prev) => (prev === key ? null : key))
              }
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 cursor-pointer ${
                activeFilter === key ? filterActive : filterInactive
              }`}
            >
              {label}
            </button>
          ))}
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="px-4 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition cursor-pointer"
            >
              Clear ✕
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-400 mb-4">
          {filteredModules.length} module
          {filteredModules.length !== 1 ? "s" : ""} found
        </p>

        {/* Module cards*/}
        {filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <svg
              className="w-12 h-12 mb-3 opacity-40"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <p className="text-base font-medium">No modules match your search.</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredModules.map((mod) => {
              const { label, badge, dot } = getStatus(mod);
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className="w-full text-left bg-white rounded-2xl border border-slate-200 px-6 py-5 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-150 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-slate-800 group-hover:text-green-600 transition truncate">
                        {mod.Heading ?? "Untitled Module"}
                      </h2>
                      {mod.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {mod.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                    </span>
                  </div>

                  {/* Optional progress bar — rendered only if mod.progress exists */}
                  {typeof mod.percentage === "number" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{mod.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${mod.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal popup */}
      {selectedModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setSelectedModule(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedModule(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            >
              ✕
            </button>

            {/* Module info */}
            <h2 className="text-xl font-bold text-slate-800 pr-6 mb-1">
              {selectedModule.Heading ?? "Untitled Module"}
            </h2>
            {selectedModule.description && (
              <p className="text-sm text-slate-500 mb-6">
                {selectedModule.description}
              </p>
            )}

            <p className="text-sm font-medium text-slate-600 mb-4">
              What would you like to do?
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {

                  // TODO REATEMPT LOGIC ////////////////////////////////////////////////////////////////////////////////////////////////////////////

                  setSelectedModule(null);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-medium text-sm hover:bg-amber-100 transition cursor-pointer"
              >
                Re-attempt this module
              </button>

              <button
                onClick={() => {

                  // TODO NEXT MODULE NAVIFATION ////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  
                  setSelectedModule(null);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium text-sm hover:bg-green-100 transition cursor-pointer"
              >
                Continue to next module
              </button>

              <button
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-100 transition cursor-pointer"
              >
                Return to module list
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
