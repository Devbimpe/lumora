"use client";

import { Suspense } from 'react';
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from '@/app/components/AuthProvider';
import { api } from '@/app/_lib/api-client';

function UserProgressContent() {
  const { user } = useAuth();

  const [modules, setModules] = useState([]); // All modules
  const [moduleProgress, setModuleProgress] = useState([]); //Modules with progress made
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null); // module that opens the popup
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [selectedModuleKCs, setSelectedModuleKCs] = useState(null); // knowledge checks for the popup module

  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchModules = async () => {
    try {
      const data = await api.get("/api/modules").json();
      const sorted = [...data].sort((a, b) => {
        const aId = Number(a.ModuleID ?? a.moduleId ?? 0);
        const bId = Number(b.ModuleID ?? b.moduleId ?? 0);
        const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : aId;
        const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : bId;
        return aOrder - bOrder || aId - bId;
      });
      setModules(sorted);
      return sorted;
    } catch (err) {
      console.error("Failed to fetch modules:", err);
      return [];
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;
    try {
      const data = await api.get("/api/progress", { searchParams: { userId: user.uid } }).json();
      console.log("Progress", data);
      if(Array.isArray(data)) {
        setModuleProgress(data);
      }
    } catch (error) {
      console.error("Progress fetch failed:", error);
    } finally {
      setLoading(false);
      setProgressLoaded(true);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchModules()
      fetchUserProgress();
    }
  }, [user]);

useEffect(() => {
  const modId = searchParams.get("modId");
  if (!modId || modules.length === 0 || !progressLoaded) return; // ← gate on progressLoaded

  const getId = (m) => m.ModuleID ?? m.moduleId;
  const match = modules.find((m) => String(getId(m)) === modId);
  if (!match) return;

  const progress = moduleProgress.find((p) => p.moduleId === getId(match));
  setSelectedModule(
    progress
      ? { ...match, ...progress }
      : { ...match, percentage: 0, isCompleted: false }
  );

  router.replace("/user-progress");
}, [modules, moduleProgress, progressLoaded]);

// Fetch knowledge checks for the selected module.
const prevFetchedModuleId = useRef(null);
useEffect(() => {
  if (!selectedModule) {
    setSelectedModuleKCs(null);
    prevFetchedModuleId.current = null;
    return;
  }
  const modId = selectedModule.ModuleID ?? selectedModule.moduleId;
  if (modId === prevFetchedModuleId.current) return;
  prevFetchedModuleId.current = modId;

  (async () => {
    try {
      const data = await api.get("/api/knowledge-checks", { searchParams: { moduleId: modId } }).json();
      if (!Array.isArray(data)) return;
      const map = {};
      for (const kc of data) {
        map[kc.knowledgeCheckId] = kc;
      }
      setSelectedModuleKCs(map);
    } catch {
      setSelectedModuleKCs({});
    }
  })();
}, [selectedModule]);

const modulesMap = modules.reduce((acc, mod) => {
  acc[mod.ModuleID] = mod;
  return acc;
}, {});

// Add heading to module progress
const enrichedProgress = moduleProgress.map((p) => ({
  ...p,
  Heading: modulesMap[p.moduleId]?.Heading ?? "Untitled Module",
  percentage: p.isCompleted ? 100 : p.percentage,
}));

const progressModuleIds = new Set(moduleProgress.map((p) => p.moduleId));

const notStartedModules = modules
  .filter((mod) => !progressModuleIds.has(mod.ModuleID))
  .map((mod) => ({ ...mod, percentage: 0, isCompleted: false }));

const bySortOrder = (a, b) => {
  const aId = Number(a.ModuleID ?? a.moduleId ?? 0);
  const bId = Number(b.ModuleID ?? b.moduleId ?? 0);
  const aSort = Number.isFinite(Number(a.sortOrder))
    ? Number(a.sortOrder)
    : Number(modulesMap[aId]?.sortOrder ?? aId);
  const bSort = Number.isFinite(Number(b.sortOrder))
    ? Number(b.sortOrder)
    : Number(modulesMap[bId]?.sortOrder ?? bId);
  return aSort - bSort || aId - bId;
};

const baseList =
  (activeFilter === "not_started"
    ? notStartedModules
    : activeFilter
    ? enrichedProgress
    : [...enrichedProgress, ...notStartedModules]
  ).sort(bySortOrder);

const filteredModules = baseList.filter((mod) => {
  const matchesSearch = (mod.Heading?.toLowerCase() ?? "").includes(
    searchQuery.toLowerCase()
  );

  const matchesFilter =
    activeFilter === null ||
    (activeFilter === "complete" && mod.isCompleted) ||
    (activeFilter === "in_progress" && !mod.isCompleted && mod.percentage > 0) ||
    activeFilter === "not_started";

  return matchesSearch && matchesFilter;
});

  // Status badge helper
  const statusConfig = {
    complete: {
      label: "Complete",
      badge: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    },
    in_progress: {
      label: "In Progress",
      badge: "bg-orange-100 text-orange-700",
      dot: "bg-orange-500",
    },
    not_started: {
      label: "Not Started",
      badge: "bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
    },
  };

  const resetUserProgress = useCallback(async () => {
  if (!user || !selectedModule) return;

  const moduleId = selectedModule.ModuleID ?? selectedModule.moduleId;

  try {
    await api.post('/api/progress', {
      json: {
        userId: user.uid,
        moduleId,
        action: 'resetUserProgress'
      }
    });
    router.push(`/modules/module${moduleId}`);
    setSelectedModule(null);
  } catch (error) {
    console.error('Failed to reset user progress:', error);
  }
}, [user, selectedModule, router]);

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
            {filteredModules.map((mod, index) => {
              const { label, badge, dot } = getStatus(mod);
              const moduleKey =
                mod.ModuleID ?? mod.moduleId ?? mod.id ?? `module-${index}`;
              return (
                <button
                  key={String(moduleKey)}
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable body */}
            <div className="overflow-y-auto p-7 flex-1">

              {/* Close */}
              <button
                onClick={() => setSelectedModule(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                ✕
              </button>

              {/* Module title */}
              <h2 className="text-xl font-bold text-slate-800 pr-6 mb-1">
                {selectedModule.Heading ?? "Untitled Module"}
              </h2>
              {selectedModule.description && (
                <p className="text-sm text-slate-500 mb-5">
                  {selectedModule.description}
                </p>
              )}

              {selectedModule.isCompleted ? (
                (() => {
                  const allSubmissions = selectedModule.knowledgeCheckSubmissions ?
                    Object.entries(selectedModule.knowledgeCheckSubmissions)
                      .map(([id, s]) => ({ ...s, _kcId: Number(id) }))
                    : [];

                  const gradedSubmissions = allSubmissions.filter(s => s.grade != null);

                  const overallScore =
                    gradedSubmissions.length === 0
                      ? (allSubmissions.length === 0 ? 100 : null)
                      : Math.round(
                          (gradedSubmissions.reduce((sum, s) => sum + (s.grade ?? 0), 0) /
                            gradedSubmissions.length)
                        );

                  const scoreBg =
                    overallScore === 100
                      ? "bg-green-50 border-green-200"
                      : overallScore != null && overallScore >= 60
                      ? "bg-orange-50 border-orange-200"
                      : overallScore != null
                      ? "bg-red-50 border-red-200"
                      : "bg-slate-50 border-slate-200";

                  const scoreLabelColor =
                    overallScore === 100
                      ? "text-green-600"
                      : overallScore != null && overallScore >= 60
                      ? "text-orange-500"
                      : overallScore != null
                      ? "text-red-500"
                      : "text-slate-500";

                  return (
                    <>
                      {/* Overall score banner */}
                      <div className={`flex items-center justify-between border rounded-xl px-5 py-4 mb-6 ${scoreBg}`}>
                        <div>
                          <p className={`text-xs font-medium uppercase tracking-wide mb-0.5 ${scoreLabelColor}`}> Overall Score </p>
                          <p className="text-2xl font-bold">{overallScore != null ? `${overallScore}%` : '—'}</p>
                        </div>
                      </div>

                      {/* Knowledge Check Scores */}
                      {allSubmissions.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">Knowledge Checks: ( {allSubmissions.length} submission{allSubmissions.length !== 1 ? 's' : ''} )</h3>
                          <div className="flex flex-col gap-2">
                            {allSubmissions.map((sub, i) => {
                              const isGraded = sub.grade != null;
                              const pct = Math.round((sub.grade ?? 0));
                              const barColor =
                                pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-orange-400" : "bg-red-400";
                              return (
                                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-slate-700 font-medium">Knowledge Check {i + 1}</p>
                                    <span className="text-sm font-bold text-slate-800">
                                      {isGraded ? `${sub.grade ?? 0}/100` : 'Submitted'}
                                    </span>
                                  </div>
                                  {isGraded ? (
                                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">Reviewed, not scored</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Free-text Feedback */}
                      {allSubmissions.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">Free-text Feedback</h3>
                          <div className="flex flex-col gap-3">
                            {allSubmissions.map((sub, i) => {
                              const isGraded = sub.grade != null;
                              return (
                                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Submission {i + 1}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                    Your Answer
                                  </p>
                                  <p className="text-sm text-slate-500 italic mb-3">{`"${sub.userAnswer}"`}</p>
                                  {sub.feedback && (
                                    <div className="rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                        Feedback
                                      </p>
                                      <p className="text-sm text-slate-700">{sub.feedback}</p>
                                    </div>
                                  )}
                                  {!isGraded &&
                                    (selectedModuleKCs?.[sub._kcId]?.explanation ? (
                                      <div className="rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm mt-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                          Explanation
                                        </p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                          {selectedModuleKCs[sub._kcId].explanation}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic">Not graded</p>
                                    ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* No submissions */}
                      {allSubmissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400 mb-6">
                          <p className="text-sm font-medium">No knowledge checks recorded.</p>
                        </div>
                      )}
                    </>
                  );
                })()
              ) : (
                // Module not yet completed
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 mb-6">
                  <p className="text-base font-medium text-slate-500">Complete the module first</p>
                  <p className="text-sm mt-1">Your results will appear here once you finish.</p>
                </div>
              )}
            </div>
            {/* Sticky action buttons */}
            <div className="border-t border-slate-100 px-7 py-5 flex flex-col gap-3 bg-white rounded-b-2xl">
              <p className="text-sm font-medium text-slate-600">What would you like to do?</p>

              <button
                onClick={resetUserProgress}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-medium text-sm hover:bg-orange-100 transition cursor-pointer"
              >
                Re-attempt this module
              </button>

              <button
                onClick={() => {
                  const getId = (m) => m.ModuleID ?? m.moduleId;
                  const currentIndex = filteredModules.findIndex((m) => getId(m) === getId(selectedModule));
                  const nextModule = filteredModules[currentIndex + 1];
                  if (nextModule) {
                    const progress = moduleProgress.find((p) => p.moduleId === getId(nextModule));
                    setSelectedModule(progress ? { ...nextModule, ...progress } : { ...nextModule, percentage: 0, isCompleted: false });
                  } else {
                    setSelectedModule(null);
                  }
                }}
                disabled={(() => {
                  const getId = (m) => m.ModuleID ?? m.moduleId;
                  return filteredModules.findIndex((m) => getId(m) === getId(selectedModule)) === filteredModules.length - 1;
                })()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium text-sm hover:bg-green-100 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-50"
              >
                {(() => {
                  const getId = (m) => m.ModuleID ?? m.moduleId;
                  return filteredModules.findIndex((m) => getId(m) === getId(selectedModule)) === filteredModules.length - 1
                    ? "No more modules"
                    : "Continue to next module";
                })()}
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

export default function UserProgressPage() {

  return (

    <Suspense fallback={

      <div className="flex items-center justify-center min-h-screen bg-slate-50">

        <div className="flex flex-col items-center gap-3">

          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />

          <p className="text-slate-500 text-sm font-medium">

            Loading…

          </p>

        </div>

      </div>

    }>

      <UserProgressContent />

    </Suspense>

  );

}
