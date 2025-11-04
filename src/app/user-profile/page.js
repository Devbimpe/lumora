"use client";
import { useState } from 'react';
import PersonalInfo from "./PersonalInfo";
import Demographics from "./Demographics";
import Portfolio from "./Portfolio";
import Settings from "./Settings";

export default function Page() {
    const [activeTab, setActiveTab] = useState("Personal Info");
    const tabs = ["Personal Info", "Demographics", "Portfolio", "Settings"];


    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <h1 className="text-5xl font-bold text-green-700 text-center my-6">User Profile</h1>
        <p className="text-green-700 text-center mb-8 text-md">Manage your LUMORA account settings and preferences</p>

        {/* Navigation Tabs */}
        <div className="bg-gray-100 rounded-full p-2 shadow-sm max-w-3xl mx-auto">
            <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    activeTab === tab
                    ? "bg-white text-green-700 shadow-md"
                    : "text-gray-700 hover:text-green-700"
                }`}
                >
                {tab}
                </button>
            ))}
            </div>
        </div>

        {/* Tab Content */}
        <div className="mt-10 text-center text-gray-700">
            {activeTab === "Personal Info" && <PersonalInfo />}
            {activeTab === "Demographics" && <Demographics />}
            {activeTab === "Portfolio" && <Portfolio />}
            {activeTab === "Settings" && <Settings />}
        </div>
      </div>
    );
  }
  