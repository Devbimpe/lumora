"use client";
import { usePathname } from 'next/navigation';
import Sidebar from './components/admin-sidebar'; // Update path as needed

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  // Extract active section safely
  const getActiveSection = () => {
    if (!pathname) return 'dashboard';
    
    const parts = pathname.split('/');
    return parts.length >= 3 ? parts[2] : 'dashboard';
  };

  const activeSection = getActiveSection();

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Sidebar activeSection={activeSection} />
      <div className="w-4/5 m-4 flex flex-col items-center p-4">
        {children}
      </div>
    </div>
  );
}