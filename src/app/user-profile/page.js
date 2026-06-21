"use client";

import { useState, useEffect } from 'react';
import PersonalInfo from "./personal-info-page/PersonalInfoForm";
import Demographics from "./Demographics";
import Portfolio from "./Portfolio";
import Settings from "./Settings";
import InfoSummary from "./personal-info-page/InfoSummary";
import { useAuth } from "@/app/components/AuthProvider";

export default function Page() {
  const [activeTab, setActiveTab] = useState("Personal Info");
  const tabs = ["Personal Info", "Demographics", "Portfolio", "Settings"];
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  const [personalInfoData, setPersonalInfoData] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchPersonalInfo() {
      const res = await fetch(`/api/user-profile-personal-info?userId=${userId}`);
      if (!res.ok) return;

      const data = await res.json();

      const mergedPersonalInfo = {
        ...(data.user.personalInfo || {}),
        name: data.user.name || data.user.personalInfo?.fullName || "",
        username: data.user.username || data.user.personalInfo?.userName || "",
        email: data.user.email || data.user.personalInfo?.email || "",
        pronouns: data.user.personalInfo?.pronouns || "",
        headline: data.user.personalInfo?.headline || "",
        bio: data.user.personalInfo?.bio || "",
      };
      setPersonalInfoData(mergedPersonalInfo);
    }

    fetchPersonalInfo();
  }, [userId]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-5xl font-bold text-green-700 text-center my-6">User Profile</h1>
      <p className="text-green-700 text-center mb-8 text-md">Manage your LUMORA account settings and preferences</p>
        
      {personalInfoData && <InfoSummary personalInfo={personalInfoData} />}
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
            {activeTab === "Personal Info" && <PersonalInfo userId={userId} personalInfo = {personalInfoData} onSaved={(updatedData) => setPersonalInfoData(updatedData)} />}
            {activeTab === "Demographics" && <Demographics userId={userId} />}
            {activeTab === "Portfolio" && <Portfolio userId={userId}/>}
            {activeTab === "Settings" && <Settings userId={userId}/>}
        </div>
      </div>
    );
  }
  