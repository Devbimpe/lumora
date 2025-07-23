'use client';
import React from 'react';
import { useState, useEffect } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submitStatus, setSubmitStatus] = useState('');

  const handleToggleActivation = async (userId, currentStatus) => {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    // Use the correct endpoint: /api/admin/users
    const response = await fetch('/api/admin/users', {
      method: 'PUT',  // Use PUT method
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isActivated: newStatus }),
    });

    // Add response validation
    if (!response.ok) {
      let errorMessage = 'Failed to update status';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Not JSON response
        const text = await response.text();
        errorMessage = `Server error: ${response.status} - ${text.slice(0, 50)}`;
      }
      throw new Error(errorMessage);
    }

    // Update UI
    setUsers(prev => prev.map(user => 
      user.UserID === userId 
        ? { ...user, isActivated: newStatus } 
        : user
    ));
    
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

      // Remove the deleted module from the UI
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
      {submitStatus && (
        <div className={`mb-4 p-3 rounded-md text-center ${
          submitStatus.includes('✅') ? 'bg-green-100 text-green-800' : 
          submitStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {submitStatus}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading users...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="text-red-500 font-bold mr-2">Error:</div>
            <div>{error}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div>
          
          <table className="w-full table-fixed">
            <tbody>
              {users.length > 0 ? (
                users.map((user,index) => (
                  
                  <React.Fragment key={user.id ?? index}>
                    {/* Main row for each module */}
                    <tr className="bg-[#dbf2e0] hover:scale-105 transition-transform duration-200 relative group">
                      <td className="py-6 px-4 text-2xl">{user.UserID}:</td>
                      <td className="py-6 px-4 text-2xl">{user.isActivated}</td>
                      <td className="py-6 px-4 text-2xl">
                        {user.Username}
                        
                        {/* Delete button - still on each row */}
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <button
                            onClick={() => handleToggleActivation(user.UserID, user.isActivated)}
                            className={`text-sm px-3 py-1 rounded ${
                              user.isActivated === 1 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                          >
                            {user.isActivated === 1 ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.UserID)}
                            className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Spacer row */}
                    <tr>
                      <td colSpan="2" className="h-4"></td>
                    </tr>
                  </React.Fragment>
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