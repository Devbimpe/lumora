'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [lastLoginTime, setLastLoginTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        // Check if user is authenticated
        if (!data.authenticated) {
          console.log('Page: Not authenticated, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if user is admin
        if (data.user.role !== 'Admin') {
          console.log('Page: Not admin, redirecting to home');
          router.push('/');
          return;
        }

        // User is authenticated and is admin
        console.log('Page: Admin access confirmed');
        setAuthorized(true);
        
        if (data.user.lastLoginTime) {
          setLastLoginTime(data.user.lastLoginTime);
        }
      } catch (error) {
        console.error('Page: Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchData();
  }, [router]);

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

  if (!authorized) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800 mb-6">
        Welcome Admin!
      </h1>
      <p className="text-2xl text-gray-600">
        Last login time: {formatLoginTime(lastLoginTime)}
      </p>
    </div>
  );
}