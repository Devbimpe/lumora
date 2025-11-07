"use client";
import { useState } from "react";
import { Globe, Linkedin, Github} from "lucide-react"; // Took the reference from https://lucide.dev/icons/

export default function Portfolio() {
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedInError, setLinkedInError] = useState("");
  const [githubError, setGithubError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [save, setSave] = useState("");

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

  const handleSave = async () => {
    if (!userId) {
      setSave("User not logged in.");
      return;
    }
    
    if (linkedInError || githubError || websiteError) {
      setSave("Fix errors before saving.");
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
        setSave("Saved successfully!");
      } else {
        setSave(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setSave("Error saving links.");
    }
  };

  return (
    <div className="bg-white p-6 text-left rounded-xl shadow-sm border border-gray-200">
      <p className="text-xl text-green-700 mb-2">Portfolio Links</p>
      <p className="text-black-700 mb-6 text-md">Connect your professional profiles and portfolio</p>

      {/* LinkedIn */}
      <div className="mb-5">
        <p className="flex gap-2 text-gray-800 font-medium mb-1">
          <Linkedin size={18} className="text-green-700" />
          <b>LinkedIn Profile</b>
        </p>
        <input type="text" value={linkedIn} onChange={(e) => {setLinkedIn(e.target.value); validateLinkedIn(e.target.value);}} placeholder="https://linkedin.com/in/username" className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600" />
        {linkedInError && <p className="text-red-600 text-sm mt-1">{linkedInError}</p>}
      </div>

      {/* GitHub */}
      <div className="mb-5">
        <p className="flex items-center gap-2 text-gray-800 font-medium mb-1">
          <Github size={18} className="text-green-700" />
          <b>GitHub Profile</b>
        </p>
        <input type="text" value={github} onChange={(e) => {setGithub(e.target.value); validateGitHub(e.target.value);}} placeholder="https://github.com/username" className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600" />
        {githubError && <p className="text-red-600 text-sm mt-1">{githubError}</p>}
      </div>

      {/* Website */}
      <div className="mb-5">
        <p className="flex items-center gap-2 text-gray-800 font-medium mb-1">
          <Globe size={18} className="text-green-700" />
          <b>Personal Website</b>
        </p>
        <input type="text" value={website} onChange={(e) => {setWebsite(e.target.value); validateWebsite(e.target.value)}} placeholder="URL" className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600" />
        {websiteError && <p className="text-red-600 text-sm mt-1">{websiteError}</p>}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button onClick={handleSave} className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition">Save</button>
      </div>
      {save && <p className="mt-2 text-sm text-gray-700 text-center">{save}</p>}

      {/* Preview Links */}
      {(linkedIn || github || website) && (
        <div>
          <hr className="my-6" />
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Preview Links</h3>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            {linkedIn && !linkedInError && (
              <a href={linkedIn} target="_blank" className="flex items-center gap-2 text-green-700 hover:underline mb-2"><Linkedin size={18}/>LinkedIn Profile</a>
            )}
            {github && !githubError && (
              <a href={github} target="_blank" className="flex items-center gap-2 text-green-700 hover:underline mb-2"><Github size={18}/>GitHub Profile</a>
            )}
            {website && !websiteError && (
              <a href={website} target="_blank" className="flex items-center gap-2 text-green-700 hover:underline"><Globe size={18}/> Personal Website</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
