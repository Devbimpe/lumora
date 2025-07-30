"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner'; 
import ErrorMessage from '../components/ErrorMessage';     
import StatusMessage from '../components/StatusMessage';   
import UserRow from '../components/UserRow';              

export default function UserManagementPage() { 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleToggleActivation = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActivated: newStatus }),
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
      alert(`User status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error('Toggle error:', error);
      alert(error.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(prev => prev.filter(user => user.UserID !== id));
      alert('User deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 relative pb-16 min-h-screen">
      <StatusMessage message={submitStatus} />

      {loading && <LoadingSpinner message="Loading users..." />}

      {error && <ErrorMessage error={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && (
        <div>
          <table className="w-full table-fixed">
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <UserRow
                    key={user.id ?? index}
                    user={user}
                    onToggleActivation={handleToggleActivation}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="py-6 px-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}