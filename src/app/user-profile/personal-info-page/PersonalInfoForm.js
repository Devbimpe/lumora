"use client";

import { useState, useEffect } from "react";

export default function PersonalInfo({ userId, personalInfo: mergedPersonalInfo, onSaved }) {
  // Form fields
  const [fullName, setFullName] = useState("");
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [customPronouns, setCustomPronouns] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  const [save, setSave] = useState("");
  const [saveError, setSaveError] = useState("red");

  const PRONOUN_OPTIONS = ["He/Him", "She/Her", "They/Them", "Other"];

  // Load data from API
  useEffect(() => {
    async function loadData() {
      if (!userId) return;

      const res = await fetch(`/api/user-profile-personal-info?userId=${userId}`);
      if (!res.ok) return;

      const data = await res.json();
      const personalInfo = data.user.personalInfo || {};
      const mergedPersonalInfo = {...(data.user.PersonalInfo || {}), 
                                    fullName: data.user.fullName || "", 
                                    userName: data.user.userName || "", 
                                    email: data.user.email || ""
                                  };

      // Set form fields from personalInfo only
      setFullName(mergedPersonalInfo.fullName || "");
      setUsername(mergedPersonalInfo.userName || "");
      setEmail(mergedPersonalInfo.email || "");
      setPronouns(mergedPersonalInfo.pronouns || "");
      setHeadline(mergedPersonalInfo.headline || "");
      setBio(mergedPersonalInfo.bio || "");

      // Handle custom pronouns
      if (mergedPersonalInfo.pronouns && !PRONOUN_OPTIONS.includes(mergedPersonalInfo.pronouns)) {
        setPronouns("Other");
        setCustomPronouns(mergedPersonalInfo.pronouns);
      }
    }

    loadData();
  }, [userId]);

    useEffect(() => {
        if (mergedPersonalInfo) {
        setFullName(prev => prev || mergedPersonalInfo.fullName || mergedPersonalInfo.name || "");
        setUsername(prev => prev || mergedPersonalInfo.userName || mergedPersonalInfo.username || "");
        }
    }, [mergedPersonalInfo]);

  // Save handler
  const handleSave = async () => {
    if (!userId) {
      setSave("User not logged in.");
      setSaveError("red");
      return;
    }

    const pronounsToSave =
      pronouns === "Other" ? customPronouns.trim() : pronouns;

    if (pronouns === "Other" && customPronouns.trim() === "") {
      setSave("Please enter your pronouns");
      setSaveError("red");
      return;
    }

    try {
      const res = await fetch("/api/user-profile-personal-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName,
          userName,
          email,
          pronouns: pronounsToSave,
          headline,
          bio,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSave("Saved Successfully!");
        setSaveError("green");

        if (onSaved) {
          onSaved();
        }
      } else {
        setSave(`Error: ${data.error}`);
        setSaveError("red");
      }
    } catch (error) {
      setSave("Error saving personal information.");
      setSaveError("red");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-left">

      {/* Title */}
      <p className="text-xl text-green-700 mb-2">Personal Information</p>
      <p className="text-gray-700 mb-6">Update your basic profile details</p>

      <div className="flex flex-wrap -mx-2">

        {/* Full Name */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Full Name</b>
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>

        {/* Username */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Username</b>
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={userName}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Email</b>
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Pronouns */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Pronouns</b>
          <select
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={pronouns}
            onChange={e => setPronouns(e.target.value)}
          >
            <option value="">Select pronouns</option>
            {PRONOUN_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {pronouns === "Other" && (
          <div className="w-full px-2 mb-4">
            <input
              type="text"
              className="w-full p-3 bg-gray-100 rounded-lg"
              placeholder="Enter your pronouns"
              value={customPronouns}
              onChange={e => setCustomPronouns(e.target.value)}
            />
          </div>
        )}

        {/* Headline */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Headline</b>
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={headline}
            onChange={e => setHeadline(e.target.value)}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col mb-4">
        <b>Bio</b>
        <textarea
          className="w-full p-3 bg-gray-100 rounded-lg"
          value={bio}
          onChange={e => setBio(e.target.value)}
        />
      </div>

      {/* Save button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition"
        >
          Save
        </button>
      </div>

      {/* Status Message */}
      {save && (
        <p
          className={`mt-2 text-sm text-center ${
            saveError === "red" ? "text-red-600" : "text-green-700"
          }`}
        >
          {save}
        </p>
      )}
    </div>
  );
}
