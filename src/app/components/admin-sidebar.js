'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar({ activeSection }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const sections = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin' },
    { id: 'user-management', label: 'User Management', path: '/admin/user-management' },
    { id: 'feedback', label: 'Feedback', path: '/admin/feedback' },
    { id: 'progress', label: 'Module Progress', path: '/admin/module-progress' },
    { id: 'management', label: 'Module Management', path: '/admin/module-management' },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = '/';
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm" style={{ backgroundColor: '#dbfbe7' }}>
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logolong.png" 
              alt="Lumora Logo" 
              width={150} 
              height={45} 
              className="h-8 w-auto" 
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <nav className="p-4 space-y-1">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={section.path}
                  onClick={closeMobileMenu}
                  className={`block text-sm font-medium rounded-lg px-4 py-3 transition-all duration-200 ${
                    activeSection === section.id 
                      ? 'bg-green-50 text-green-700 border-l-3 border-green-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {section.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 space-y-2 border-t border-gray-200">
              <Link
                href="/training-module"
                onClick={closeMobileMenu}
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                Training Module
              </Link>
              <button
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-200 shadow-sm" style={{ backgroundColor: '#dbfbe7' }}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image 
              src="/logolong.png" 
              alt="Lumora Logo" 
              width={200} 
              height={60} 
              className="h-10 w-auto" 
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={section.path}
              className={`block text-sm font-medium rounded-lg px-4 py-3 transition-all duration-200 ${
                activeSection === section.id 
                  ? 'bg-green-50 text-green-700 border-l-3 border-green-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-gray-200">
          <Link
            href="/training-module"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            Training Module
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}