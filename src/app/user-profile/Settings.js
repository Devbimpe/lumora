"use client";
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export default function Settings({ userId }) {
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

      {/* Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-lg mx-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <p className="text-lg font-bold text-red-600">Warning!</p>
            </div>
            <p className="mt-4 text-gray-700">This action cannot be undone. This will permanently delete your account and remove all your data from servers, including:</p>
            <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
              <li>Profile information</li>
              <li>Learning progress and achievements</li>
              <li>Module completions</li>
              <li>All feedback and contributions</li>
            </ul>

            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowModal(false)} className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition">Cancel</button>
              <button disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition">{loading ? "Deleting..." : <><Trash2 size={16} /> Yes, Delete my account</>}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
