"use client"

import React from "react"

export default function UserRow({ user, onToggleActivation, onDelete }) {
  return (
    <React.Fragment>
      <tr className="bg-[#dbf2e0] hover:scale-105 transition-transform duration-200 relative group">
        <td className="py-6 px-4 text-2xl">{user.UserID}:</td>
        <td className="py-6 px-4 text-2xl">{user.isActivated}</td>
        <td className="py-6 px-4 text-2xl">
          {user.Username}
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => onToggleActivation(user.UserID, user.isActivated)}
              className={`text-sm px-3 py-1 rounded ${
                user.isActivated === 1
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              }`}
            >
              {user.isActivated === 1 ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => onDelete(user.UserID)}
              className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      <tr>
        <td colSpan="2" className="h-4"></td>
      </tr>
    </React.Fragment>
  )
}