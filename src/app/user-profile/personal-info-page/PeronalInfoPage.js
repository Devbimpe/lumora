"use client";
import { useEffect, useState } from "react";
import InfoSummary from "./InfoSummary";
import PersonalInfo from "./PersonalInfo";

export default function PersonalInfoPage({ userId }) {
  const [personalInfo, setPersonalInfo] = useState(null);

  async function loadPersonalInfo() {
    if (!userId) return;

    const res = await fetch(`/api/user-profile-personal-info?userId=${userId}`);
    if (!res.ok) return;

    const data = await res.json();
    setPersonalInfo(data.user.personalInfo);
  }

  useEffect(() => {
    loadPersonalInfo();
  }, [userId]);

  return (
    <div className="space-y-6">
      
      {personalInfo && (
        <InfoSummary personalInfo={personalInfo} />
      )}

      <PersonalInfo userId={userId} onSaved={loadPersonalInfo} />
    </div>
  );
}
