"use client";

import { useEffect, useState } from "react";
import InfoSummary from "./InfoSummary";
import PersonalInfo from "./PersonalInfo";

export default function PersonalInfoPage({ userId }) {
  const [personalInfo, setPersonalInfo] = useState(null);

  // Load personal info from API
  async function loadPersonalInfo() {
    if (!userId) return;

    const res = await fetch(`/api/user-profile-personal-info?userId=${userId}`);
    if (!res.ok) return;

    const data = await res.json();

    // All fields come from personalInfo 
    setPersonalInfo({
      fullName: data.user.personalInfo.fullName || "",
      userName: data.user.personalInfo.userName || "",
      email: data.user.personalInfo.email || "",
      pronouns: data.user.personalInfo.pronouns || "",
      headline: data.user.personalInfo.headline || "",
      bio: data.user.personalInfo.bio || "",
    });
  }

  useEffect(() => {
    loadPersonalInfo();
  }, [userId]);

  return (
    <div className="space-y-6">
      {personalInfo && <InfoSummary personalInfo={personalInfo} />}
      <PersonalInfo userId={userId} onSaved={loadPersonalInfo} />
    </div>
  );
}
