"use client";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useAuth } from "@/app/components/AuthProvider";
import { api } from "@/app/_lib/api-client";

// This JS object is to represent an ENUM for module status filters
const moduleStatusENUM = {
  All: "all",
  Completed: "completed",
  InProgress: "in-progress",
  NotStarted: "not-started"
}

// This JS object is to represent an ENUM for search topics
const searchTopicsENUM = {
  User: "User",
  Module: "Module"
}



export default function ModuleProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState([]);
  const [modules, setModules] = useState([]);
  const [modulesDropdownOptions, setModulesDropdownOptions] = useState([]);
  const [selectedModule, setSelectedModule] = useState({ value: null, label: "All Modules" });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(moduleStatusENUM.All);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTopic, setSearchTopic] = useState(searchTopicsENUM.User);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

  const fetchProgress = async () => {
    try {
      
      const data = await api.get('/api/admin/module-progress').json();

      const progressData = data.progress || [];
      const modulesData = data.modules || [];

      const formattedModules = modulesData.reduce((acc, module) => {
        acc[module.moduleId] = module.heading;
        return acc;
      }, {});

      if (isMounted) {
        setModules(formattedModules);
        setModulesDropdownOptions([
          { value: null, label: "All Modules" },
          ...modulesData.map(module => ({
            value: module.moduleId,
            label: module.heading
          }))
        ]);
        setProgress(progressData);
      }
    } catch (err) {
      if (isMounted) {
        console.error("Error fetching module progress:", err);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchProgress();

  return () => {
    isMounted = false;
  };
}, [authLoading, user]);

  //Filter once for progress
  //then filter again for search and search topic
  const filterProgress = () => {
    return progress.filter((p) => { // Filter based on status
      if (filter === moduleStatusENUM.Completed) return p.completed;
      if (filter === moduleStatusENUM.InProgress) return !p.completed && p.progress > 0;
      if (filter === moduleStatusENUM.NotStarted) return p.progress === 0;
      return true;
    }).filter((p) => { // filter based on searched user
      if (!searchTerm) return true;
      if (searchTopic === searchTopicsENUM.User) {
        return p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
          || p.userName.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (searchTopic === searchTopicsENUM.Module) {
        return p.moduleId.toString().toLowerCase() === searchTerm.toLowerCase() || modules[p.moduleId].toLowerCase().includes(searchTerm.toLowerCase());
      }
    }).filter((p) => {
      return selectedModule.value == null || selectedModule.value === p.moduleId;
    })
      ;
  }
  const filteredProgress = filterProgress();

  //This will render the filters buttons
  const renderFilters = () => {
    return (
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${showFilters
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-3">
            {[
              { value: moduleStatusENUM.All, label: "All" },
              { value: moduleStatusENUM.Completed, label: "Completed" },
              { value: moduleStatusENUM.InProgress, label: "In Progress" },
              { value: moduleStatusENUM.NotStarted, label: "Not Started" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${filter === tab.value
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  //This will be used to debouce the search input
  const debounceSearch = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }
  const debouncedSetSearchTerm = useMemo(
    () => debounceSearch(setSearchTerm, 250),
    []
  );

  useEffect(() => {
    setSearchInputValue(searchTerm ?? "");
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
        <span className="text-gray-600 text-lg font-medium">Loading module progress...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Module Progress</h1>
        <p className="text-sm sm:text-base text-gray-600">Track student progress across all modules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">

        <button className="bg-white justify-items-start rounded-xl shadow-lg hover:shadow-xl active:scale-98 active:shadow-lg transition-all duration-200 p-3 sm:p-4 md:p-6 border-l-4 border-purple-500 cursor-pointer" onClick={(e) => setFilter(moduleStatusENUM.All)}>
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">{
            searchTopic === searchTopicsENUM.User
              ? "Students"
              : "Modules"
          }</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2 sm:mt-3">{
            searchTopic === searchTopicsENUM.User
              ? progress.reduce((uniqueUsers, p) => {
                if (!uniqueUsers.some(u => u.userId === p.userId)) {
                  uniqueUsers.push({ userId: p.userId });
                } return uniqueUsers;
              }, []).length
              : Object.keys(modules).length
          }
          </p>
        </button>

        <button className="bg-white justify-items-start rounded-xl shadow-lg hover:shadow-xl active:scale-98 active:shadow-lg transition-all duration-200 p-3 sm:p-4 md:p-6 border-l-4 border-green-500 cursor-pointer"
          onClick={(e) => { setFilter(moduleStatusENUM.Completed); setShowFilters(true) }}
        >
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">Completed</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2 sm:mt-3">
            {progress.filter((p) => p.completed).length}
          </p>
        </button>

        <button
          className="bg-white justify-items-start w-100% rounded-xl shadow-lg hover:shadow-xl active:scale-98 active:shadow-lg transition-all duration-200 p-3 sm:p-4 md:p-6 border-l-4 border-orange-500 cursor-pointer"
          onClick={(e) => { setFilter(moduleStatusENUM.InProgress); setShowFilters(true) }}
        >
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">In Progress</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2 sm:mt-3">
            {progress.filter((p) => !p.completed && p.progress > 0).length}
          </p>
        </button>

        <button
          className="bg-white justify-items-start rounded-xl shadow-lg p-3 hover:shadow-xl active:scale-98 active:shadow-lg transition-all duration-200 sm:p-4 md:p-6 border-l-4 border-gray-500 cursor-pointer"
          onClick={(e) => { setFilter(moduleStatusENUM.NotStarted); setShowFilters(true) }}
        >
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">Not Started</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2 sm:mt-3">
            {progress.filter((p) => p.progress === 0).length}
          </p>
        </button>

      </div>


      {/* Searchbar and Filters */}
      <div className={`bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col ${showFilters ? "sm:gap-4 gap-3" : "gap-0"}`}>

        {/* Searchbar + Filter Button + Toggle button */}
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex w-full items-stretch gap-3 sm:flex-2 lg:flex-[2.5]">

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center p-2 sm:p-2.5 rounded-lg transition-colors duration-200 ease-in-out bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer shrink-0 ${showFilters ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-[inset_0_2px_6px_rgba(0,0,0,0.1),inset_-2px_0_6px_rgba(0,0,0,0.1)]"}`}
            >
              <span className="relative block size-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`absolute inset-0 size-6 transition-opacity duration-200 ease-in-out ${showFilters ? "opacity-100" : "opacity-0"}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`absolute inset-0 size-6 transition-opacity duration-200 ease-in-out ${showFilters ? "opacity-0" : "opacity-100"}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                <span className={`bg-green-600 rounded-full w-2 h-2 absolute -top-1/2 -right-1/2 transition-opacity duration-200 ease-in-out ${filter === moduleStatusENUM.All || showFilters ? "opacity-0" : "opacity-100"}`}></span>
              </span>
            </button>


            {/* Search Bar */}
            <input
              type="text"
              autoComplete="new-password"
              placeholder={`Search by ${searchTopic === searchTopicsENUM.User ? "student" : "module"}...`}
              value={searchInputValue}
              onChange={(e) => {
                const nextValue = e.target.value ?? "";
                setSearchInputValue(nextValue);
                debouncedSetSearchTerm(nextValue);
              }}
              className="flex-1 min-w-0 self-stretch bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 transition-all duration-200 border-0! px-3 sm:px-4 py-2 sm:py-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] rounded-lg! focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none! text-sm text-gray-900 placeholder:text-gray-500 leading-5"
            />
          </div>

          {/* Module Dropdown */}
          <Select unstyled
            options={modulesDropdownOptions}
            value={selectedModule}
            onChange={setSelectedModule}
            isSearchable={true}
            classNames={{
              control: ({ isFocused }) => `
                    flex-1 w-50 self-stretch transition-all duration-200
                    px-3 sm:px-4 py-2 sm:py-2 h-full
                    bg-gray-100 hover:bg-gray-200
                    overflow-hidden border-0!
                    ${isFocused ? "bg-gray-200 ring-2 ring-green-500 border-transparent shadow-none" : "border-0! shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)]"}
                    rounded-lg! outline-none! text-sm leading-5 flex items-center
                  `,
              singleValue: () => "text-sm text-gray-900 leading-5",
              placeholder: () => "text-sm text-gray-500 leading-5",
              menu: () => "mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50",
              option: ({ isFocused, isSelected }) => `
                    px-4 py-2 text-sm cursor-pointer transition-colors
                    ${isSelected ? "bg-green-600 text-white" : ""}
                    ${isFocused && !isSelected ? "bg-green-50 text-green-700" : ""}
                    ${!isFocused && !isSelected ? "text-gray-700" : ""}`,

              input: () => "text-sm",

              indicatorSeparator: () => "hidden",
              dropdownIndicator: () => "text-gray-400 hover:text-gray-600 px-2",
            }}
          ></Select>
          {/* Toggle Button
          <div className="flex w-full sm:flex-1 lg:flex-[1.2] self-stretch items-stretch sm:max-w-64">
            <button
              onClick={() => setSearchTopic(searchTopicsENUM.User)}
              className={`flex-1 self-stretch px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg rounded-r-none font-medium transition-all duration-200 text-sm sm:text-sm leading-5 outline-none ${searchTopic === searchTopicsENUM.User
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-[inset_0_2px_6px_rgba(0,0,0,0.1),inset_-2px_0_6px_rgba(0,0,0,0.1)] cursor-pointer"
                }`}
            >
              Students
            </button>
            <button
              onClick={() => setSearchTopic(searchTopicsENUM.Module)}
              className={`flex-1 self-stretch px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm sm:text-sm leading-5 rounded-l-none ${searchTopic === searchTopicsENUM.Module
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-[inset_0_2px_6px_rgba(0,0,0,0.1),inset_2px_0_6px_rgba(0,0,0,0.1)] cursor-pointer"

                }`}
            >
              Modules
            </button>
          </div> */}
        </div>


        {/* Filter Buttons */}
        {renderFilters()}
      </div>

      {/* Progress Grid */}
      {filteredProgress.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProgress.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md flex-shrink-0">
                    {p.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 min-w-0">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{p.fullName}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">@{p.userName}</p>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                    Module {p.moduleId} - {modules[p.moduleId]}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {Math.round(p.progress * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden shadow-[inset_0_2px_2px_rgba(0,0,0,0.1)]">
                    <div
                      className={`h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm ${p.completed
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : p.progress > 0
                          ? "bg-gradient-to-r from-orange-400 to-orange-600"
                          : "bg-gray-300"
                        }`}
                      style={{ width: `${Math.round(p.progress * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${p.completed
                      ? "bg-green-100 text-green-800"
                      : p.progress > 0
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {p.completed ? "✓ Done" : p.progress > 0 ? "In Progress" : "Not Started"}
                  </span>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">No progress data found for this filter.</p>
        </div>
      )}
    </div>
  );
}
