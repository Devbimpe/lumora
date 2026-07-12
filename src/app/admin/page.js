'use client';
import { useAuth } from '@/app/components/AuthProvider';
import {useState, useEffect} from 'react';
import {api} from '@/app/_lib/api-client';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    async function loadUserCount() {
      try {
        const data = await api.get('/api/admin/users').json();
        setUserCount(data.length);
      } catch (error) {
        console.error('Failed to load user count', error);
        setUserCount(null);
      }
    }
    loadUserCount();
  }, []);

  const formatLoginTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <p className="text-2xl text-gray-600">Verifying access</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-green-600">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome Admin!
        </h1>
        <p className="text-sm text-gray-600">
          Last login: {formatLoginTime(user?.account?.metadata?.lastSignInTime)}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <a 
          href="/admin/user-management"
          className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 text-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Users</h3>

            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>

          </div>
          <p className="text-sm sm:text-base opacity-70 font-medium">{userCount !== null ? `${userCount} total` : 'Loading...'}</p>
        </a>

        <a 
          href="/admin/module-management"
          className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 text-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Modules</h3>
            
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm sm:text-base opacity-70 font-medium">Create and manage learning content.</p>
        </a>

        <a 
          href="/admin/module-progress"
          className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 text-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Progress</h3>
            
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base opacity-70 font-medium">Track student completion rates.</p>
        </a>

        <a 
          href="/admin/feedback"
          className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 text-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Feedback</h3>
            
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base opacity-70 font-medium">Review learner feedback.</p>
        </a>
      
      </div>
    </div>
  );
}