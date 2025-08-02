"use client";
import { usePathname } from 'next/navigation';
import AdminSidebar from './components/admin-sidebar'; 

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const getActiveSection = () => {
    if (!pathname) return 'dashboard';
    const parts = pathname.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart === 'admin' || lastPart === '') return 'dashboard';
    return lastPart;
  };

  const activeSection = getActiveSection();

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <AdminSidebar activeSection={activeSection} />
      <div className="w-4/5 m-4 flex flex-col items-center p-4">{children}</div>
    </div>
  );
}