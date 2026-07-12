"use client";

import { useState, useEffect } from "react";
import { api, apiErrorMessage } from "@/app/_lib/api-client";

export default function PersonalInfo({ userId, personalInfo: personalInfo, onSaved }) {
  // Form fields
  const [fullName, setFullName] = useState("");
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [customPronouns, setCustomPronouns] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // Save status and error color
  const [save, setSave] = useState("");
  const [saveError, setSaveError] = useState("red");

  const PRONOUN_OPTIONS = ["He/Him", "She/Her", "They/Them", "Other"];

  // Load user data from API on component mount or userId change
  useEffect(() => {
    async function loadData() {
      if (!userId) return;

      try {
        const data = await api.get("/api/user-profile-personal-info", { searchParams: { userId } }).json();
        const personalInfo = data.user.personalInfo || {};

        setFullName(data.user.name || "");
        setUsername(data.user.username || "");
        setEmail(data.user.email || personalInfo.email || "");
        setPronouns(personalInfo.pronouns || "");
        setHeadline(personalInfo.headline || "");
        setBio(personalInfo.bio || "");

        // Handle custom pronouns if not in options
        if (personalInfo.pronouns && !PRONOUN_OPTIONS.includes(personalInfo.pronouns)) {
          setPronouns("Other");
          setCustomPronouns(personalInfo.pronouns);
        }
      } catch { /* ignore load errors */ }
    }

    loadData();
  }, [userId]);

  // Save handler for updating personal info
  const handleSave = async () => {
    if (!userId) {
      setSave("User not logged in.");
      setSaveError("red");
      return;
    }

    const pronounsToSave = pronouns === "Other" ? customPronouns.trim() : pronouns;

    if (pronouns === "Other" && customPronouns.trim() === "") {
      setSave("Please enter your pronouns");
      setSaveError("red");
      return;
    }

    try {
      await api.post("/api/user-profile-personal-info", {
        json: {
          userId,
          fullName,
          userName,
          email,
          pronouns: pronounsToSave,
          headline,
          bio,
        },
      });

      setSave("Saved Successfully!");
      setSaveError("green");

      // Trigger callback after successful save
      if (onSaved) {
        onSaved({
          name: fullName,
          username: userName,
          email,
          pronouns: pronounsToSave,
          headline,
          bio,
        });
      }
    } catch (error) {
      const msg = await apiErrorMessage(error, "Error saving personal information.");
      setSave(msg);
      setSaveError("red");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-left">

      {/* Title */}
      <p className="text-xl text-green-700 font-bold mb-2">Personal Information</p>
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
            disabled
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
            disabled
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

        {/* Custom pronouns input */}
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
