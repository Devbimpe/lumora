'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Detect if we are on the content editing page with a moduleId
  const isContentPage = pathname.includes('/admin/content');
  const moduleId = searchParams.get('moduleId');
  const mode = searchParams.get('mode');
  const showContentSidebar = isContentPage && moduleId && mode !== 'new';

  // Content sidebar state
  const [contentPages, setContentPages] = useState([]);
  const [knowledgeChecks, setKnowledgeChecks] = useState([]);
  const [moduleName, setModuleName] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedKCId, setSelectedKCId] = useState(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [kcFormOpen, setKcFormOpen] = useState(false);

  // Fetch content pages when on the content page
  useEffect(() => {
    if (!showContentSidebar) return;

    async function fetchContentPages() {
      setContentLoading(true);
      try {
        const [contentRes, modulesRes, kcRes] = await Promise.all([
          fetch(`/api/content?moduleId=${moduleId}`),
          fetch('/api/admin/modules'),
          fetch(`/api/knowledge-checks?moduleId=${moduleId}`)
        ]);

        if (contentRes.ok) {
          const data = await contentRes.json();
          setContentPages(data);
        }

        if (modulesRes.ok) {
          const modules = await modulesRes.json();
          const moduleIdNum = Number(moduleId);
          const currentModule = modules.find((m) => Number(m.id) === moduleIdNum);
          if (currentModule) {
            setModuleName(currentModule.Heading || `Module ${moduleId}`);
          }
        }

        if (kcRes.ok) {
          const kcData = await kcRes.json();
          setKnowledgeChecks(Array.isArray(kcData) ? kcData : []);
        }
      } catch (err) {
        console.error('Failed to fetch content for sidebar:', err);
      } finally {
        setContentLoading(false);
      }
    }

    fetchContentPages();

    // Listen for content and KC changes (custom events from page.js)
    const handleContentUpdate = () => fetchContentPages();
    window.addEventListener('content-updated', handleContentUpdate);
    window.addEventListener('kc-updated', handleContentUpdate);
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
      window.removeEventListener('kc-updated', handleContentUpdate);
    };
  }, [showContentSidebar, moduleId]);

  const scrollToPage = (contentId) => {
    setSelectedPageId(contentId);
    setSelectedKCId(null);
    const element = document.getElementById(`content-page-${contentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToKC = (kcId) => {
    setSelectedKCId(kcId);
    setSelectedPageId(null);
    const element = document.getElementById(`knowledge-check-${kcId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  const toggleCreateForm = () => {
    setCreateFormOpen((prev) => !prev);
    window.dispatchEvent(new CustomEvent('toggle-create-form'));
    setIsMobileMenuOpen(false);
  };

  const toggleKCForm = () => {
    setKcFormOpen((prev) => !prev);
    window.dispatchEvent(new CustomEvent('toggle-kc-form'));
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const syncCreateForm = (e) => {
      if (e.detail?.open !== undefined) setCreateFormOpen(e.detail.open);
    };
    window.addEventListener('sync-create-form', syncCreateForm);
    return () => window.removeEventListener('sync-create-form', syncCreateForm);
  }, []);

  useEffect(() => {
    const syncKCForm = (e) => {
      if (e.detail?.open !== undefined) setKcFormOpen(e.detail.open);
    };
    window.addEventListener('sync-kc-form', syncKCForm);
    return () => window.removeEventListener('sync-kc-form', syncKCForm);
  }, []);

  // ─── DEFAULT ADMIN SIDEBAR SECTIONS ───
  const sections = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin' },
    { id: 'user-management', label: 'User Management', path: '/admin/user-management' },
    { id: 'feedback', label: 'Feedback', path: '/admin/feedback' },
    { id: 'progress', label: 'Module Progress', path: '/admin/module-progress' },
    { id: 'management', label: 'Module Management', path: '/admin/module-management' },
  ];

  const getActiveSection = () => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname.includes('user-management')) return 'user-management';
    if (pathname.includes('feedback')) return 'feedback';
    if (pathname.includes('module-progress')) return 'progress';
    if (pathname.includes('module-management') || pathname.includes('content')) return 'management';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  const handleLogout = () => {
    setShowLogoutConfirm(true)
    } 
    const confirmLogout = async () => {
      try {
        await logoutAndBroadcast()
        router.push('/')
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ─── CONTENT SIDEBAR (when editing a module's content) ───
  if (showContentSidebar) {
    return (
      <>
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm" style={{ backgroundColor: '#dbfbe7' }}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <h2
                className="text-lg font-bold text-gray-800 max-w-full"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {moduleName || `Module ${moduleId}`}
              </h2>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 bg-white max-h-[70vh] overflow-y-auto">
              <div className="p-3">
                <Link
                  href="/admin/module-management"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium mb-3 px-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Modules
                </Link>

                {contentLoading ? (
                  <p className="text-sm text-gray-500 px-2 py-3">Loading pages...</p>
                ) : (
                  <div className="space-y-1">
                    {contentPages.map((page, index) => (
                      <button
                        key={`page-${page.ContentID}`}
                        onClick={() => scrollToPage(page.ContentID)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${selectedPageId === page.ContentID
                          ? 'bg-green-50 text-green-700 font-semibold border-l-3 border-green-600 shadow-sm'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                      >
                        <div className="flex items-center">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-3 bg-gray-200 text-gray-600">
                            {index + 1}
                          </span>
                          <span className="text-sm truncate flex-1">{page.Overview || `Page ${index + 1}`}</span>
                          {page.ImageURL && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">IMG</span>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Add Page button */}
                    <button
                      onClick={toggleCreateForm}
                      className={`w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors mt-1 ${createFormOpen
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      <svg
                        className={`w-6 h-6 transition-transform duration-200 ${createFormOpen ? 'rotate-45' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="w-full text-center">{createFormOpen ? 'Close New Content Form' : 'Add Page'}</p>
                    </button>

                    {knowledgeChecks.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 pt-3 pb-1">Knowledge Checks</p>
                        {knowledgeChecks.map((kc, index) => {
                          const isMultipleChoice = Array.isArray(kc.choices) && kc.choices.length > 0;
                          return (
                            <button
                              key={`kc-${kc.knowledgeCheckId}`}
                              onClick={() => scrollToKC(kc.knowledgeCheckId)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${selectedKCId === kc.knowledgeCheckId
                                ? 'bg-green-50 text-green-700 font-semibold border-l-3 border-green-600 shadow-sm'
                                : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                }`}
                            >
                              <div className="flex items-center">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-3 bg-gray-200 text-gray-600">
                                  {index + 1}
                                </span>
                                <span className="text-sm truncate flex-1">{kc.question || `Knowledge Check ${index + 1}`}</span>
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${isMultipleChoice ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                  {isMultipleChoice ? 'MC' : 'DESC'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}

                    {/* Add Knowledge Check button */}
                    <button
                      onClick={toggleKCForm}
                      className={`w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors mt-1 ${kcFormOpen
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      <svg
                        className={`w-6 h-6 transition-transform duration-200 ${kcFormOpen ? 'rotate-45' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="w-full text-center">{kcFormOpen ? 'Close New KC Form' : 'Add Knowledge Check'}</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Content Sidebar */}
        <div className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-200 shadow-sm" style={{ backgroundColor: '#dbfbe7' }}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <Link
              href="/admin/module-management"
              className="inline-flex items-center text-green-700 hover:text-green-800 mb-3 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Modules
            </Link>
            <h2
              className="text-lg font-bold text-green-700 leading-tight max-w-full"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {moduleName || `Module ${moduleId}`}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {contentPages.length} {contentPages.length === 1 ? 'page' : 'pages'}
              {knowledgeChecks.length > 0 && ` · ${knowledgeChecks.length} ${knowledgeChecks.length === 1 ? 'knowledge check' : 'knowledge checks'}`}
            </p>
          </div>

          {/* Page List */}
          <nav className="flex-1 overflow-y-auto p-3">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {contentPages.map((page, index) => (
                  <button
                    key={`page-${page.ContentID}`}
                    onClick={() => scrollToPage(page.ContentID)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${selectedPageId === page.ContentID
                      ? 'bg-green-50 text-green-700 font-semibold border-l-3 border-green-600 shadow-sm'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-3 bg-gray-200 text-gray-600">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate flex-1">{page.Overview || `Page ${index + 1}`}</span>
                      {page.ImageURL && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded flex-shrink-0">IMG</span>
                      )}
                    </div>
                  </button>
                ))}

                {/* Add Page button */}
                <button
                  onClick={toggleCreateForm}
                  className={`w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors mt-1 ${createFormOpen
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  <svg
                    className={`w-6 h-6 transition-transform duration-200 ${createFormOpen ? 'rotate-45' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="w-full text-center">{createFormOpen ? 'Close New Content Form' : 'Add Page'}</p>
                </button>

                {knowledgeChecks.length > 0 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 pt-3 pb-1">Knowledge Checks</p>
                )}

                {knowledgeChecks.map((kc, index) => {
                  const isMultipleChoice = Array.isArray(kc.choices) && kc.choices.length > 0;
                  return (
                    <button
                      key={`kc-${kc.knowledgeCheckId}`}
                      onClick={() => scrollToKC(kc.knowledgeCheckId)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${selectedKCId === kc.knowledgeCheckId
                        ? 'bg-green-50 text-green-700 font-semibold border-l-3 border-green-600 shadow-sm'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                        }`}
                    >
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-3 bg-gray-200 text-gray-600">
                          {index + 1}
                        </span>
                        <span className="text-sm truncate flex-1">{kc.question || `Knowledge Check ${index + 1}`}</span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${isMultipleChoice ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                          {isMultipleChoice ? 'MC' : 'DESC'}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Add Knowledge Check button */}
                <button
                  onClick={toggleKCForm}
                  className={`w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors mt-1 ${kcFormOpen
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  <svg
                    className={`w-6 h-6 transition-transform duration-200 ${kcFormOpen ? 'rotate-45' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="w-full text-center">{kcFormOpen ? 'Close New KC Form' : 'Add Knowledge Check'}</p>
                </button>
              </div>
            )}
          </nav>

          {/* Bottom: Logout only */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── DEFAULT ADMIN SIDEBAR ───
  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm" style={{ backgroundColor: '#dbfbe7' }}>
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <Image
              src="http://res.cloudinary.com/du6yiw4it/image/upload/v1772423261/LumoraLogo-Transparent.png"
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
                  className={`block text-sm font-medium rounded-lg px-4 py-3 transition-all duration-200 ${activeSection === section.id
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
              src="http://res.cloudinary.com/du6yiw4it/image/upload/v1772423261/LumoraLogo-Transparent.png"
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
              className={`block text-sm font-medium rounded-lg px-4 py-3 transition-all duration-200 ${activeSection === section.id
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

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Log out?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}