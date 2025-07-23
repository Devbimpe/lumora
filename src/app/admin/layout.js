"use client";
import { usePathname } from 'next/navigation';
import Sidebar from '../components/admin-sidebar';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const activeSection = pathname.split('/').pop() || 'dashboard';

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Sidebar activeSection={activeSection} />
      <div className="w-4/5 m-4 flex flex-col items-center p-4">
        {children}
      </div>
    </div>
  );
}