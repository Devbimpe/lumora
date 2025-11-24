"use client";
import { useState, useEffect } from "react";
export default function PersonalInfo({ userId }) {
  const [fullName, setFullName] = useState("");
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [save, setSave] = useState("");
  const [saveError, setSaveError] = useState("red");


  useEffect(() => {
  async function loadData() {
    if (!userId) return;
  
    const res = await fetch(`/api/user-profile-personal-info?userId=${userId}`);
    if (!res.ok) return;
  
    const data = await res.json();
    const personalInfo = data.user.personalInfo || {};
  
    setFullName(personalInfo.fullName || "");
    setUsername(personalInfo.userName || "");
    setEmail(personalInfo.email || "");
    setPronouns(personalInfo.pronouns || "");
    setHeadline(personalInfo.headline || "");
    setBio(personalInfo.bio || "");
  }
  
  loadData();
}, [userId]);
  
const handleSave = async () => {
  if (!userId) {
    setSave("User not logged in.");
    setSaveError("red");
    return;
  }

  try{
    const res = await fetch("/api/user-profile-personal-info", {
      method: "POST",
      headers: {"Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        fullName,
        userName,
        email,
        pronouns,
        headline,
        bio
      }),
    });
  
    const data = await res.json();
    if (res.ok) {
      setSave("Saved Successfully!");
      setSaveError("green");
    } 
    else {
      setSave(`Error: ${data.error}`);
      setSaveError("red");
    }
  } catch (error){
    console.error(error);
    setSave("Error saving personal information.");
    setSaveError("red")
  }
};




return (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-left">
    <p className="text-xl text-green-700 mb-2">Personal Information</p>
    <p className="text-gray-700 mb-6">Update your basic profile details</p>
    
    <div className="flex flex-wrap -mx-2">
      <div className="w-full md:w-1/2 px-2 mb-4">
        <b>Full Name</b>
          <input type="text" className="w-full p-3 bg-gray-100 rounded-lg" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className="w-full md:w-1/2 px-2 mb-4">
        <b>Username</b>
          <input type="text" className="w-full p-3 bg-gray-100 rounded-lg" value={userName} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div className="w-full md:w-1/2 px-2 mb-4">
        <b>Email</b>
          <input type ="text" className="w-full p-3 bg-gray-100 rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="w-full md:w-1/2 px-2 mb-4">
        <b>Pronouns</b>
          <input type ="text" className="w-full p-3 bg-gray-100 rounded-lg" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
      </div>
    
      <div className="w-full md:w-1/2 px-2 mb-4">
        <b>Headline</b>
          <input type ="text" className="w-full p-3 bg-gray-100 rounded-lg" value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </div>
    </div>

    <div className="flex flex-col mb-4">
        <b>Bio</b>
          <textarea className="w-full p-3 bg-gray-100 rounded-lg" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
    
    <div className="flex justify-center">
        <button onClick={handleSave} className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition">Save</button>
    </div>
    {save && <p className={`mt-2 text-sm text-center ${saveError === "red" ? "text-red-600" : "text-green-700"}`}>{save}</p>}
    
  </div>
);
}


  