"use client";
import { useState, useEffect } from 'react';
import { User, BarChart3, Briefcase, Settings as SettingsIcon } from 'lucide-react';
import PersonalInfo from "./PersonalInfo";
import Demographics from "./Demographics";
import Portfolio from "./Portfolio";
import Settings from "./Settings";

export default function Page() {
    const [activeTab, setActiveTab] = useState("Personal Info");
    const tabs = [
      { name: "Personal Info", icon: User },
      { name: "Demographics", icon: BarChart3 },
      { name: "Portfolio", icon: Briefcase },
      { name: "Settings", icon: SettingsIcon }
    ];
    const [userId, setUserId] = useState(null);

    useEffect(() => {
      async function loadUser() {
        const res = await fetch("/api/check-auth");
        const data = await res.json();
    
        if (data.authenticated) {
          setUserId(data.user.id); 
        } else {
          console.log("User not logged in");
        }
      }
    
      loadUser();
    }, []);

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white">
        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-8 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-2 sm:mb-3">
              User Profile
            </h1>
            <p className="text-green-600/80 text-xs sm:text-base max-w-md mx-auto px-2">
              Manage your LUMORA account settings and preferences
            </p>
          </div>

          {/* Navigation Tabs - Mobile Optimized */}
          <div className="mb-6 sm:mb-10">
            {/* Mobile: Horizontal scrollable tabs with icons */}
            <div className="sm:hidden">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 px-1 -mx-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-200 min-w-[80px] ${
                        activeTab === tab.name
                          ? "bg-green-700 text-white shadow-lg shadow-green-700/25"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700"
                      }`}
                    >
                      <Icon size={20} strokeWidth={activeTab === tab.name ? 2.5 : 2} />
                      <span className="text-[10px] font-medium whitespace-nowrap">
                        {tab.name === "Personal Info" ? "Personal" : tab.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Pill-style tabs */}
            <div className="hidden sm:block">
              <div className="bg-gray-100 rounded-full p-1.5 shadow-sm max-w-2xl mx-auto">
                <div className="grid grid-cols-4 gap-1.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                          activeTab === tab.name
                            ? "bg-white text-green-700 shadow-md"
                            : "text-gray-600 hover:text-green-700"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="text-center text-gray-700 animate-in fade-in duration-300">
            {activeTab === "Personal Info" && <PersonalInfo />}
            {activeTab === "Demographics" && <Demographics />}
            {activeTab === "Portfolio" && <Portfolio userId={userId}/>}
            {activeTab === "Settings" && <Settings userId={userId}/>}
          </div>
        </div>
      </div>
    );
  }
  