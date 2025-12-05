"use client";
import { useState, useEffect } from "react";
import { Globe, Linkedin, Github} from "lucide-react"; // Took the reference from https://lucide.dev/icons/

export default function Portfolio({ userId }) {
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedInError, setLinkedInError] = useState("");
  const [githubError, setGithubError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [save, setSave] = useState("");
  const [saveError, setSaveError] = useState("red");

  const validateLinkedIn = (value) => {
    const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/.+$/; // Took the reference from https://regex101.com/library
    if (!regex.test(value) && value !== "") {
      setLinkedInError("Enter a valid LinkedIn URL (https://linkedin.com/in/username)");
    } else {
      setLinkedInError("");
    }
  };

  const validateGitHub = (value) => {
    const regex = /^https:\/\/(www\.)?github\.com\/.+$/; // Took the reference from https://regex101.com/library
    if (!regex.test(value) && value !== "") {
      setGithubError("Enter a valid GitHub URL (https://github.com/username)");
    } else {
      setGithubError("");
    }
  };

  const validateWebsite = (value) => {
    const regex = /^(https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/.*)?$/i; // Took the reference from https://regexr.com/3au3g
    if (!regex.test(value) && value !== "") {
      setWebsiteError("Enter a valid website URL (e.g., https://yourwebsite.com)");
    } else {
      setWebsiteError("");
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!userId) return;
  
      const res = await fetch(`/api/user-profile-portfolio?userId=${userId}`);
      if (!res.ok) return;
  
      const data = await res.json();
      const portfolio = data.user.portfolio || {};
  
      setLinkedIn(portfolio.linkedIn || "");
      setGithub(portfolio.github || "");
      setWebsite(portfolio.website || "");
    }
  
    loadData();
  }, [userId]);  

  const handleSave = async () => {
    if (!userId) {
      setSave("User not logged in.");
      setSaveError("red");
      return;
    }
    
    if (linkedInError || githubError || websiteError) {
      setSave("Fix errors before saving.");
      setSaveError("red");
      return;
    }

    try {
      const res = await fetch("/api/user-profile-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          linkedIn,
          github,
          website,
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
      setSave("Error saving links.");
      setSaveError("red");
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 text-left rounded-xl shadow-sm border border-gray-200">
      <p className="text-lg sm:text-xl text-green-700 mb-1 sm:mb-2 font-semibold">Portfolio Links</p>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Connect your professional profiles and portfolio</p>

      {/* LinkedIn */}
      <div className="mb-4 sm:mb-5">
        <label className="flex items-center gap-2 text-gray-800 font-medium mb-2 text-sm sm:text-base">
          <div className="bg-green-50 p-1.5 rounded-lg">
            <Linkedin size={16} className="text-green-700" />
          </div>
          <span>LinkedIn Profile</span>
        </label>
        <input 
          type="text" 
          value={linkedIn} 
          onChange={(e) => {setLinkedIn(e.target.value); validateLinkedIn(e.target.value);}} 
          placeholder="https://linkedin.com/in/username" 
          className="w-full p-3 text-sm sm:text-base rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition" 
        />
        {linkedInError && <p className="text-red-600 text-xs sm:text-sm mt-1.5">{linkedInError}</p>}
      </div>

      {/* GitHub */}
      <div className="mb-4 sm:mb-5">
        <label className="flex items-center gap-2 text-gray-800 font-medium mb-2 text-sm sm:text-base">
          <div className="bg-green-50 p-1.5 rounded-lg">
            <Github size={16} className="text-green-700" />
          </div>
          <span>GitHub Profile</span>
        </label>
        <input 
          type="text" 
          value={github} 
          onChange={(e) => {setGithub(e.target.value); validateGitHub(e.target.value);}} 
          placeholder="https://github.com/username" 
          className="w-full p-3 text-sm sm:text-base rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition" 
        />
        {githubError && <p className="text-red-600 text-xs sm:text-sm mt-1.5">{githubError}</p>}
      </div>

      {/* Website */}
      <div className="mb-5 sm:mb-6">
        <label className="flex items-center gap-2 text-gray-800 font-medium mb-2 text-sm sm:text-base">
          <div className="bg-green-50 p-1.5 rounded-lg">
            <Globe size={16} className="text-green-700" />
          </div>
          <span>Personal Website</span>
        </label>
        <input 
          type="text" 
          value={website} 
          onChange={(e) => {setWebsite(e.target.value); validateWebsite(e.target.value)}} 
          placeholder="https://yourwebsite.com" 
          className="w-full p-3 text-sm sm:text-base rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition" 
        />
        {websiteError && <p className="text-red-600 text-xs sm:text-sm mt-1.5">{websiteError}</p>}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button 
          onClick={handleSave} 
          className="bg-green-700 text-white px-8 py-2.5 rounded-lg hover:bg-green-800 transition font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          Save Changes
        </button>
      </div>
      {save && <p className={`mt-3 text-sm text-center ${saveError === "red" ? "text-red-600" : "text-green-700"}`}>{save}</p>}

      {/* Preview Links */}
      {(linkedIn || github || website) && (
        <div className="mt-6">
          <hr className="border-gray-200" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mt-5 mb-3">Preview Links</h3>
          <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200 space-y-3">
            {linkedIn && !linkedInError && (
              <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-green-700 hover:text-green-800 hover:underline text-sm sm:text-base">
                <Linkedin size={18}/>
                <span className="truncate">LinkedIn Profile</span>
              </a>
            )}
            {github && !githubError && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-green-700 hover:text-green-800 hover:underline text-sm sm:text-base">
                <Github size={18}/>
                <span className="truncate">GitHub Profile</span>
              </a>
            )}
            {website && !websiteError && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-green-700 hover:text-green-800 hover:underline text-sm sm:text-base">
                <Globe size={18}/>
                <span className="truncate">Personal Website</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
