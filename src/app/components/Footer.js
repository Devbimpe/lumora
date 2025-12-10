'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on module and admin pages
  const isModulePage = pathname?.startsWith('/modules/');
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    // Ensure the body has the necessary classes for the footer to stick to the bottom
    document.body.classList.add('flex', 'flex-col', 'min-h-screen');
  }, []);

  const handleFAQClick = (e) => {
    e.preventDefault();
    
    // If we're on the home page, scroll to FAQ section
    if (pathname === '/') {
      const faqSection = document.getElementById('faq');
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // If we're on another page, navigate to home with hash
      window.location.href = '/#faq';
    }
  };

  // Don't render footer on module or admin pages
  if (isModulePage || isAdminPage) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Links */}
          <nav className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8">
            <a 
              href="#" 
              className="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm md:text-base"
            >
              Info about Dalhousie SE Lab
            </a>
            <a 
              href="/contact" 
              className="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm md:text-base"
            >
              Contact Info
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm md:text-base"
            >
              Copyrights
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm md:text-base"
            >
              References
            </a>
            <a 
              href="#faq" 
              onClick={handleFAQClick}
              className="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm md:text-base"
            >
              FAQs
            </a>
          </nav>
          
          {/* Copyright */}
          <div className="text-gray-500 text-sm text-center md:text-right">
            © {new Date().getFullYear()} Lumora. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

