"use client";
import { useState } from "react";
import { Globe, Linkedin, Github} from "lucide-react"; // Took the reference from https://lucide.dev/icons/

export default function Portfolio() {
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");

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
        <input type="text" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600" />
      </div>

      {/* GitHub */}
      <div className="mb-5">
        <p className="flex items-center gap-2 text-gray-800 font-medium mb-1">
          <Github size={18} className="text-green-700" />
          <b>GitHub Profile</b>
        </p>
        <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600" />
      </div>

      {/* Website */}
      <div className="mb-5">
        <p className="flex items-center gap-2 text-gray-800 font-medium mb-1">
          <Globe size={18} className="text-green-700" />
          <b>Personal Website</b>
        </p>
        <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="URL" className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600" />
      </div>
    </div>
  );
}
