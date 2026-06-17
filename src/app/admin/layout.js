'use client'
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import Sidebar from '@/app/admin/components/admin-sidebar';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user?.role !== 'Admin') {
      console.warn('User is not admin:', user?.email);
      redirect('/');
    }
  }, [user, loading]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col p-3 pt-20 sm:p-6 sm:pt-20 lg:p-8 w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
