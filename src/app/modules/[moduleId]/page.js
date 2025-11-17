'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '../Module.css';

export default function ModulePage() {
  const { moduleId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rawContent, setRawContent] = useState([]);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleHeading, setModuleHeading] = useState('');
  const [moduleSubheading, setModuleSubheading] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [allModules, setAllModules] = useState([]);
  const [user, setUser] = useState(null);
  
  // Refs to prevent duplicate API calls
  const trackedContentViews = useRef(new Set());
  const allModulesFetched = useRef(false);
  const trackingInProgress = useRef(false);
  const completedContentIds = useRef(new Set());
  const completedModules = useRef(new Set());
  
  // Get current content ID from URL or default to first content
  const currentContentId = searchParams.get('content') || null;

  // Format text as list if it contains bullet points
  function formatAsList(text) {
    if (!text) return null;
    const parts = text.split('●').map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return <p className="mb-4 text-gray-700 leading-relaxed">{text}</p>;
    return (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
        {parts.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }

  // Fetch all modules only once on mount
  useEffect(() => {
    if (allModulesFetched.current) return;
    
    async function fetchAllModules() {
      try {
        const res = await fetch('/api/modules');
        if (res.ok) {
          const data = await res.json();
          setAllModules(data);
          allModulesFetched.current = true;
        }
      } catch (err) {
        console.error('Failed to fetch modules:', err);
      }
    }
    
    fetchAllModules();
  }, []); // Only run once on mount

  // Check auth status only once, or if user is not set
  useEffect(() => {
    if (user) return; // Skip if user is already set
    
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/check-auth");
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    }
    
    checkAuthStatus();
  }, [user]); // Only check if user is not set

  // Fetch content when moduleId changes
  useEffect(() => {
    // Reset tracking when module changes (same contentId can exist in different modules)
    trackedContentViews.current.clear();
    completedContentIds.current.clear();
    
    async function fetchContent() {
      setLoading(true);
      try {
        // Fetch content for the current moduleId
        const res = await fetch(`/api/Module?moduleId=${moduleId.replace('module', '')}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setRawContent(data);
        
        if (data && data.length > 0) {
          setModuleHeading(data[0]?.Heading || 'Module');
          setModuleSubheading(data[0]?.Subheading || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchContent();
  }, [moduleId]);

  useEffect(() => {
    if (!rawContent.length) return;

    // Build sidebar items from raw content
    const sidebar = [];
    const processedContentIds = new Set();
    const contentMap = new Map();

    // First pass: collect all content items
    rawContent.forEach((item) => {
      if (!processedContentIds.has(item.ContentID)) {
        processedContentIds.add(item.ContentID);
        
        if (item.Question && item.Question.trim().length > 0) {
          // Knowledge check
          contentMap.set(item.ContentID, {
            type: 'quiz',
            contentId: item.ContentID,
            overview: item.Overview || 'Knowledge Check',
            question: item.Question,
            options: item.Reading
              ? item.Reading.split(/(?=[A-D]\.\s)/g).map((s) => s.trim()).filter(Boolean)
              : [],
            answer: item.Answer?.trim() ?? '',
          });
        } else if (item.Overview && item.Overview.trim().toLowerCase() === 'common misconceptions') {
          // Misconception - will be paired with correction
          contentMap.set(item.ContentID, {
            type: 'misconception',
            contentId: item.ContentID,
            overview: item.Overview,
            text: item.Reading,
          });
        } else if (item.Overview && item.Overview.trim().toLowerCase() === 'correction') {
          // Correction - will be paired with misconception
          contentMap.set(item.ContentID, {
            type: 'correction',
            contentId: item.ContentID,
            overview: item.Overview,
            text: item.Reading,
          });
        } else {
          // Regular reading content
          contentMap.set(item.ContentID, {
            type: 'reading',
            contentId: item.ContentID,
            overview: item.Overview || '',
            text: item.Reading,
          });
        }
      }
    });

    // Second pass: build sidebar with proper ordering
    const sortedContentIds = Array.from(processedContentIds).sort((a, b) => a - b);
    const misconceptionPairs = [];
    const correctionPairs = [];

    sortedContentIds.forEach((contentId) => {
      const item = contentMap.get(contentId);
      
      if (item.type === 'misconception') {
        misconceptionPairs.push(item);
      } else if (item.type === 'correction') {
        correctionPairs.push(item);
      } else {
        sidebar.push({
          ...item,
          title: item.overview || `Content ${item.contentId}`,
        });
      }
    });

    // Add misconceptions table if we have pairs
    if (misconceptionPairs.length > 0 && correctionPairs.length > 0) {
      const misPairs = misconceptionPairs.map((m, i) => ({
        misconception: m.text?.trim() ?? '',
        correction: correctionPairs[i]?.text?.trim() ?? '',
      }));
      
      // Find the first misconception contentId
      const misContentId = misconceptionPairs[0]?.contentId || sortedContentIds.length + 1;
      sidebar.push({
        type: 'misTable',
        contentId: misContentId,
        overview: 'Common Misconceptions',
        pairs: misPairs,
        title: 'Common Misconceptions',
      });
    }

    // Sort sidebar by contentId
    sidebar.sort((a, b) => a.contentId - b.contentId);

    setSidebarItems(sidebar);

    // Set current content based on URL or first item
    const contentIdToShow = currentContentId ? parseInt(currentContentId) : sidebar[0]?.contentId;
    const contentToShow = sidebar.find(item => item.contentId === contentIdToShow) || sidebar[0];
    setCurrentContent(contentToShow);
  }, [rawContent, currentContentId]);

  // Track content view (with deduplication)
  const trackContentView = useCallback(async (contentId) => {
    if (!user || !contentId) return;
    
    // Prevent duplicate tracking for the same content
    const trackingKey = `${moduleId}-${contentId}`;
    if (trackedContentViews.current.has(trackingKey) || trackingInProgress.current) {
      return;
    }
    
    trackingInProgress.current = true;
    trackedContentViews.current.add(trackingKey);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: moduleId.replace('module', ''),
          action: 'view',
          contentId: contentId
        })
      });
    } catch (error) {
      console.error('Failed to track content view:', error);
      // Remove from set on error so it can be retried
      trackedContentViews.current.delete(trackingKey);
    } finally {
      trackingInProgress.current = false;
    }
  }, [user, moduleId]);

  // Track content completion (when quiz is answered correctly) - with deduplication
  const trackContentCompletion = useCallback(async (contentId) => {
    if (!user || !contentId) return;
    
    // Prevent duplicate tracking
    const completionKey = `${moduleId}-${contentId}`;
    if (completedContentIds.current.has(completionKey)) {
      return;
    }
    
    completedContentIds.current.add(completionKey);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: moduleId.replace('module', ''),
          action: 'complete',
          contentId: contentId
        })
      });
    } catch (error) {
      console.error('Failed to track content completion:', error);
      // Remove from set on error so it can be retried
      completedContentIds.current.delete(completionKey);
    }
  }, [user, moduleId]);

  // Track module completion - with deduplication
  const trackModuleCompletion = useCallback(async () => {
    if (!user) return;
    
    // Prevent duplicate tracking
    if (completedModules.current.has(moduleId)) {
      return;
    }
    
    completedModules.current.add(moduleId);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: moduleId.replace('module', ''),
          action: 'completeModule'
        })
      });
    } catch (error) {
      console.error('Failed to track module completion:', error);
      // Remove from set on error so it can be retried
      completedModules.current.delete(moduleId);
    }
  }, [user, moduleId]);

  const handleOptionClick = useCallback((contentId, letter, correctAnswer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [contentId]: letter
    }));
    
    // Track completion if answer is correct
    if (letter === correctAnswer && user) {
      trackContentCompletion(contentId);
    }
  }, [user, trackContentCompletion]);

  const handleSidebarClick = (contentId) => {
    router.push(`/modules/${moduleId}?content=${contentId}`);
    // Don't track here - let the useEffect handle it to avoid duplicates
  };

  // Track content view when current content changes (only once per content)
  useEffect(() => {
    if (currentContent?.contentId && user) {
      trackContentView(currentContent.contentId);
    }
  }, [currentContent?.contentId, user, trackContentView]);

  const handleNext = () => {
    const currentIndex = sidebarItems.findIndex(item => item.contentId === currentContent?.contentId);
    if (currentIndex < sidebarItems.length - 1) {
      const nextContent = sidebarItems[currentIndex + 1];
      handleSidebarClick(nextContent.contentId);
    }
  };

  const handlePrev = () => {
    const currentIndex = sidebarItems.findIndex(item => item.contentId === currentContent?.contentId);
    if (currentIndex > 0) {
      const prevContent = sidebarItems[currentIndex - 1];
      handleSidebarClick(prevContent.contentId);
    }
  };

  const handleGoToNextModule = useCallback(() => {
    // Mark current module as completed
    if (user) {
      trackModuleCompletion();
    }
    
    const currentModuleIdNum = parseInt(moduleId.replace('module', ''));
    const nextModule = allModules.find(m => m.ModuleID === currentModuleIdNum + 1);
    if (nextModule) {
      router.push(`/modules/module${nextModule.ModuleID}`);
    }
  }, [user, moduleId, allModules, trackModuleCompletion, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading module content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Error: {error}</p>
          <Link href="/training-module" className="text-green-700 hover:underline">
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  if (!sidebarItems.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No content available for this module</p>
          <Link href="/training-module" className="text-green-700 hover:underline">
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  if (!currentContent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading content...</p>
      </div>
    );
  }

  const currentIndex = sidebarItems.findIndex(item => item.contentId === currentContent.contentId);
  const moduleIdNum = moduleId.replace('module', '');

  // Check if we should show "Go to Next Module" button
  const isLastContent = currentIndex === sidebarItems.length - 1;
  const isQuiz = currentContent?.type === 'quiz';
  const isQuizAnswered = currentContent && selectedAnswers[currentContent.contentId] !== undefined;
  const isQuizCorrect = isQuiz && currentContent && selectedAnswers[currentContent.contentId] === currentContent.answer;
  const currentModuleIdNum = parseInt(moduleId.replace('module', ''));
  const nextModule = allModules.find(m => m.ModuleID === currentModuleIdNum + 1);
  const showNextModuleButton = isLastContent && isQuiz && isQuizAnswered && isQuizCorrect && nextModule;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm fixed left-0 top-0 h-screen overflow-y-auto">
        <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
          <Link href="/training-module" className="inline-flex items-center text-green-700 hover:text-green-800 mb-4 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Modules
          </Link>
          <h2 className="text-lg font-bold text-green-700">{moduleHeading}</h2>
          {moduleSubheading && (
            <p className="text-xs text-gray-600 mt-1">{moduleSubheading}</p>
          )}
        </div>
        
        <nav className="p-2">
          <div className="space-y-1">
            {sidebarItems.map((item, index) => {
              const isActive = currentContent.contentId === item.contentId;
              const isCompleted = index < currentIndex; // Simple completion tracking
              const displayNumber = index + 1; // Sequential numbering starting from 1
              
              return (
                <button
                  key={item.contentId}
                  onClick={() => handleSidebarClick(item.contentId)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-green-100 text-green-700 font-semibold border-l-4 border-green-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted && !isActive ? '✓' : displayNumber}
                    </span>
                    <span className="text-sm truncate">{item.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">

          {/* Content Display */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {currentContent.type === 'reading' && (
              <div className="prose prose-lg max-w-none">
                {formatAsList(currentContent.text)}
              </div>
            )}

            {currentContent.type === 'misTable' && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-700">Misconception</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-700">Correction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentContent.pairs.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.misconception}</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.correction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {currentContent.type === 'quiz' && (
              <>
                <p className="text-lg font-semibold text-gray-800 mb-6">{currentContent.question}</p>
                <ul className="space-y-3">
                  {currentContent.options.map((opt, idx) => {
                    const letter = opt.charAt(0);
                    const isSelected = selectedAnswers[currentContent.contentId] === letter;
                    const isCorrect = currentContent.answer === letter;
                    const showFeedback = selectedAnswers[currentContent.contentId] !== undefined;

                    return (
                      <li
                        key={idx}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          !showFeedback
                            ? 'border-gray-300 hover:border-green-400 bg-white hover:bg-green-50'
                            : isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 bg-white opacity-60'
                        }`}
                        onClick={() => handleOptionClick(currentContent.contentId, letter, currentContent.answer)}
                      >
                        <div className="flex items-start">
                          {showFeedback && isCorrect && (
                            <span className="text-green-600 mr-3 text-xl">✓</span>
                          )}
                          {showFeedback && isSelected && !isCorrect && (
                            <span className="text-red-600 mr-3 text-xl">✗</span>
                          )}
                          <span className="text-gray-800">{opt}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                ← Previous
              </button>
              
              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {sidebarItems.length}
              </span>
              
              {!showNextModuleButton && (
                <button
                  onClick={handleNext}
                  disabled={currentIndex === sidebarItems.length - 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentIndex === sidebarItems.length - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Next →
                </button>
              )}
            </div>

            {/* Go to Next Module Button */}
            {showNextModuleButton && (
              <div className="mt-4 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-700 mb-2">
                    🎉 Congratulations! You've completed this module!
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Ready to continue your learning journey?
                  </p>
                  <button
                    onClick={handleGoToNextModule}
                    className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Go to Next Module →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}