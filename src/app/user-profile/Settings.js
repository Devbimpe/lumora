"use client";

export default function Settings({ userId }) {
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
      </div>
    </div>
  );
}
