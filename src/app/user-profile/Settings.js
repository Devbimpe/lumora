"use client";
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react"; // Took the reference from https://lucide.dev/icons/
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";

export default function Settings({ userId }) {
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); 
  const { user, signOut } = useAuth();

  const handleDelete = async () => {
    if (!user) {
      setStatus("User not logged in.");
      setShowModal(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user-profile-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await res.json();
      setShowModal(false);
      if (res.ok) {
        setStatus("Account deleted successfully.");
        await signOut();
        router.push("/");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error deleting account.");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 text-left rounded-xl shadow-sm border border-gray-200">
      <p className="text-lg sm:text-xl text-green-700 mb-1 sm:mb-2 font-bold">Account Settings</p>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Manage your account preferences</p>

      {/* Delete Account Section - Mobile Optimized */}
      <div className="bg-red-50 border border-red-300 p-4 sm:p-5 rounded-xl mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-red-700 text-base sm:text-lg font-semibold">Delete Account</p>
            <p className="text-red-600 text-sm sm:text-base mt-1">Permanently delete your account and all associated data.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-red-600 text-white px-6 sm:px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition w-full sm:w-auto text-sm sm:text-base font-medium"
          >
            <Trash2 size={18} /> 
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {status && (<p className={`mt-2 text-sm text-center ${ status.includes("Error") ? "text-red-600" : "text-green-700"}`}>{status}</p>)}

      {/* Delete Modal - Mobile Optimized */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <p className="text-lg font-bold text-red-600">Warning!</p>
            </div>
            <p className="mt-4 text-gray-700 text-sm sm:text-base">This action cannot be undone. This will permanently delete your account and remove all your data from servers, including:</p>
            <ul className="list-disc list-inside mt-3 text-gray-700 space-y-1.5 text-sm sm:text-base">
              <li>Profile information</li>
              <li>Learning progress and achievements</li>
              <li>Module completions</li>
              <li>All feedback and contributions</li>
            </ul>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)} 
                className="bg-white border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition w-full sm:w-auto text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={loading} 
                className="bg-red-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition w-full sm:w-auto text-sm sm:text-base font-medium disabled:opacity-50"
              >
                {loading ? "Deleting..." : <><Trash2 size={16} /> Yes, Delete my account</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
