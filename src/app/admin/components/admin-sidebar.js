'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();
  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'User Management', path: '/admin/user-management' },
    { name: 'Feedback', path: '/admin/feedback' },
    { name: 'Module Progress', path: '/admin/module-progress' },
    { name: 'Module Management', path: '/admin/module-management' },
  ];

  const handleLogout = async (e, path) => {
    if (path === '/api/logout') {
      e.preventDefault();
      try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  return (
    <aside 
      className="w-64 bg-orange-500 shadow-xl overflow-y-auto shrink-0"
      style={{
        position: 'sticky',
        top: '0',
        height: '100vh',
        alignSelf: 'flex-start'
      }}
    >
      <div className="p-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={(e) => handleLogout(e, item.path)}
              className={`block px-6 py-4 mb-2 rounded-lg text-center text-lg transition-all duration-200 ${
                isActive
                  ? 'bg-orange-600 text-white font-bold shadow-lg'
                  : 'text-white hover:bg-orange-400'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}