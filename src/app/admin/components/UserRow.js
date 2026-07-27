"use client";
import { XCircle, CheckCircle, Trash2 } from 'lucide-react';

export default function UserRow({ user, onToggleActivation, onDelete }) {
  const isActive = user.isActivated === 1 || user.isActivated === '1' || user.isActivated === true;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* User ID Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 font-semibold text-sm">
              {(user.Username || user.username || user.userName || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-mono text-gray-500">
              {user.email || user.Email}
            </div>
          </div>
        </div>
      </td>

      {/* Username Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {user.Username || user.username || user.userName || 'N/A'}
        </div>
      </td>

      {/* Status Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span
            className={`w-2 h-2 mr-2 rounded-full ${
              isActive ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          {/* Toggle Status Button - only show Deactivate for active users, Activate for inactive users */}
          {isActive ? (
            <button
              onClick={() => onToggleActivation(user.UserID, user.isActivated)}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-all"
              title="Deactivate user"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => onToggleActivation(user.UserID, user.isActivated)}
              className="inline-flex items-center px-3 py-2 border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium transition-all"
              title="Activate user"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Activate
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(user.UserID)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}