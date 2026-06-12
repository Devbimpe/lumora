"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { api } from '@/app/lib/api-client';
import { useAuth } from '@/app/components/AuthProvider';
import LoadingSpinner from '../components/LoadingSpinner'; 
import ErrorMessage from '../components/ErrorMessage';     
import StatusMessage from '../components/StatusMessage';   
import UserRow from '../components/UserRow';
import ConfirmationModal from '../components/ConfirmationModal';

export default function UserManagementPage() { 
  const { loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, username: '' });
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, userId: null, username: '', currentStatus: null });

  const handleToggleActivation = async (userId, currentStatus) => {
    const user = users.find(u => u.UserID === userId);
    const username = user?.Username || user?.username || user?.userName || 'this user';
    
    // Show confirmation modal for deactivation only
    if (currentStatus === 1) {
      setDeactivateModal({ 
        isOpen: true, 
        userId, 
        username, 
        currentStatus 
      });
      return;
    }

    // If activating, proceed without confirmation
    await performToggleActivation(userId, currentStatus);
  };

  const performToggleActivation = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await api.put('/api/admin/users', {
        throwHttpErrors: false,
        json: { userId, isActivated: newStatus },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = `Server error: ${response.status} - ${text.slice(0, 50)}`;
        }
        throw new Error(errorMessage);
      }

      setUsers(prev => prev.map(user => user.UserID === userId ? { ...user, isActivated: newStatus } : user));
      setSubmitStatus(newStatus === 1 ? 'User activated successfully!' : 'User deactivated successfully!');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      console.error('Toggle error:', error);
      setSubmitStatus('Error: ' + (error.message || 'Update failed'));
      setTimeout(() => setSubmitStatus(''), 3000);
    }
  };

  const handleDeleteClick = (userId) => {
    const user = users.find(u => u.UserID === userId);
    const username = user?.Username || user?.username || user?.userName || 'this user';
    
    setDeleteModal({ 
      isOpen: true, 
      userId, 
      username 
    });
  };

  const performDelete = async () => {
    const { userId } = deleteModal;
    
    try {
      await api.delete('/api/admin/users', {
        json: { id: userId },
      });

      setUsers(prev => prev.filter(user => user.UserID !== userId));
      setSubmitStatus('User deleted successfully!');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setSubmitStatus('Error: Delete failed');
      setTimeout(() => setSubmitStatus(''), 3000);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/api/admin/users').json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let result = users;

    if (filterStatus === 'active') {
      result = result.filter(user => user.isActivated === 1 || user.isActivated === '1' || user.isActivated === true);
    } else if (filterStatus === 'inactive') {
      result = result.filter(user => user.isActivated === 0 || user.isActivated === '0' || user.isActivated === false || user.isActivated === null || user.isActivated === undefined);
    }

    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => {
        const username = user.Username || user.username || user.userName || '';
        return username.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.UserID?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, filterStatus]);

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading]);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and monitor all users in the system</p>
      </div>

      <StatusMessage message={submitStatus} />

      {loading && <LoadingSpinner message="Loading users..." />}

      {error && <ErrorMessage error={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-3 sm:p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search by username or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                    filterStatus === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                    filterStatus === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Active ({users.filter(u => u.isActivated === 1 || u.isActivated === '1' || u.isActivated === true).length})
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                    filterStatus === 'inactive'
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Inactive ({users.filter(u => u.isActivated === 0 || u.isActivated === '0' || u.isActivated === false || u.isActivated === null || u.isActivated === undefined).length})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <UserRow
                      key={user.UserID ?? index}
                      user={user}
                      onToggleActivation={handleToggleActivation}
                      onDelete={handleDeleteClick}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">No users found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm || filterStatus !== 'all' 
                            ? 'Try adjusting your search or filter criteria' 
                            : 'There are no users in the system yet'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with count */}
          {filteredUsers.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredUsers.length}</span> of <span className="font-medium text-gray-900">{users.length}</span> users
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null, username: '' })}
        onConfirm={performDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.username}"? This action cannot be undone and will permanently remove all user data.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
      />

      {/* Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false, userId: null, username: '', currentStatus: null })}
        onConfirm={() => performToggleActivation(deactivateModal.userId, deactivateModal.currentStatus)}
        title="Deactivate User"
        message={`Are you sure you want to deactivate "${deactivateModal.username}"? They can reverify their email to get activated again.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}