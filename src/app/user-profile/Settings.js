"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function Settings({ userId }) {
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="bg-white p-6 text-left rounded-xl shadow-sm border border-gray-200">
      <p className="text-xl text-green-700 mb-2 font-bold">Account Settings</p>
      <p className="text-black-700 mb-6 text-md">Manage your account preferences</p>

      {/* Delete Account Section */}
      <div className="bg-red-50 border border-red-300 p-5 rounded-xl flex justify-between items-center mb-4">
        <div>
          <p className="text-red-700 text-lg font-semibold">Delete Account</p>
          <p className="text-red-600 text-md">Permanently delete your account and all associated data.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-red-600 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"><Trash2 size={18} /> Delete</button>
      </div>

      {status && (<p className={`mt-2 text-sm text-center ${ status.includes("Error") ? "text-red-600" : "text-green-700"}`}>{status}</p>)}

    </div>
  );
}
