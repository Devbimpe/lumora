"use client";

import { useState, useEffect } from "react";

export default function Demograhics({ userId }) {
  // Local state for demographic fields
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [education, setEducation] = useState("");
  const [save, setSave] = useState("");
  const [saveError, setSaveError] = useState("red");

  useEffect(() => {
    // Loads demographic data from API when userId is available
    async function loadData() {
      if (!userId) return;

      const res = await fetch(`/api/user-profile-demographics?userId=${userId}`);
      if (!res.ok) return;

      const data = await res.json();
      const demographics = data.user.demographics || {};

      setAge(demographics.age || "");
      setLocation(demographics.location || "");
      setJobStatus(demographics.jobStatus);
      setJobTitle(demographics.jobTitle || "");
      setEducation(demographics.education || "");
    }

    loadData();
  }, [userId]);

  // Saves demographic data to API
  const handleSave = async () => {
    if (!userId) {
      setSave("User not logged in.");
      setSaveError("red");
      return;
    }

    try {
      const res = await fetch("/api/user-profile-demographics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          age,
          location,
          jobStatus,
          jobTitle,
          education,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSave("Saved Successfully!");
        setSaveError("green");
      } else {
        setSave(`Error: ${data.error}`);
        setSaveError("red");
      }
    } catch (error) {
      console.error(error);
      setSave("Error saving demograhic information.");
      setSaveError("red");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-left">
      <p className="text-xl text-green-700 mb-2">Demograhics</p>
      <p className="text-gray-700 mb-6">
        Share demograhic information for your profile
      </p>

      {/* Age */}
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Age</b>
          <input
            type="number"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Location</b>
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Job Status */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Job Status</b>
          <select
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={jobStatus}
            onChange={(e) => setJobStatus(e.target.value)}
          >
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
          </select>
        </div>

        {/* Job Title */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Job Title</b>
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        {/* Education */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <b>Education</b>
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-lg"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          />
        </div>
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
