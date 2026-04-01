'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '../Module.css';

// Helper function to parse choices into array of options
// Handles both array of strings and single string format
function parseChoices(choices) {
  if (!choices) return [];
  
  // If choices is already an array of strings
  if (Array.isArray(choices)) {
    return choices.map((choice, index) => {
      // Try to extract letter and text from string like "A: text" or "A. text"
      const match = choice.match(/^([A-D])[\.:]\s*(.+)/);
      if (match) {
        return {
          letter: match[1],
          text: match[2].trim()
        };
      }
      // Fallback: use index as letter (A=0, B=1, etc.)
      return {
        letter: String.fromCharCode(65 + index), // 65 is 'A'
        text: choice.trim()
      };
    }).sort((a, b) => a.letter.localeCompare(b.letter));
  }
  
  // If choices is a string, parse it (backward compatibility)
  const choicesString = choices;
  const regex = /([A-D]):\s*"([^"]+)"/g;
  const options = [];
  let match;
  
  while ((match = regex.exec(choicesString)) !== null) {
    options.push({
      letter: match[1],
      text: match[2]
    });
  }
  
  // If regex didn't work, try simpler split
  if (options.length === 0) {
    const parts = choicesString.split(/(?=[A-D]\.\s)/g);
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed) {
        const letterMatch = trimmed.match(/^([A-D])[\.:]\s*(.+)/);
        if (letterMatch) {
          options.push({
            letter: letterMatch[1],
            text: letterMatch[2].trim()
          });
        }
      }
    });
  }
  
  return options.sort((a, b) => a.letter.localeCompare(b.letter));
}

export default function ModulePage() {
  const { moduleId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allItems, setAllItems] = useState([]); // Unified array of pages and knowledge checks
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleHeading, setModuleHeading] = useState('');
  const [moduleSubheading, setModuleSubheading] = useState('');
  const [allModules, setAllModules] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [descriptiveAnswers, setDescriptiveAnswers] = useState({});
  
  // Refs to prevent duplicate API calls
  const allModulesFetched = useRef(false);
  const trackedViews = useRef(new Set());
  const trackingInProgress = useRef(false);
  const completedItems = useRef(new Set());
  const completedModules = useRef(new Set());
  
  // Get current item ID from URL
  const currentItemId = searchParams.get('item') || searchParams.get('page') || null;

  // Fetch all modules only once on mount (for navigation)
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

  // Load content and knowledge checks when moduleId changes
  useEffect(() => {
    setLoading(true);
    
    async function loadContent() {
      try {
        const moduleNum = moduleId.replace('module', '');
        
        // Fetch content from Firestore and knowledge checks in parallel
        const [contentRes, knowledgeChecksRes] = await Promise.all([
          fetch(`/api/content?moduleId=${moduleNum}`),
          fetch(`/api/knowledge-checks?moduleId=${moduleNum}`)
        ]);
        
        let contentItems = [];
        if (contentRes.ok) {
          try {
            contentItems = await contentRes.json();
          } catch (parseError) {
            console.error('Failed to parse content response:', parseError);
          }
        }
        
        let knowledgeChecks = [];
        if (knowledgeChecksRes.ok) {
          try {
            knowledgeChecks = await knowledgeChecksRes.json();
          } catch (parseError) {
            console.error('Failed to parse knowledge checks response:', parseError);
          }
        }
        
        // Group knowledge checks by their contentId for insertion after associated content
        const checksByContentId = {};
        const unassociatedChecks = [];
        knowledgeChecks.forEach(check => {
          if (check.contentId != null) {
            if (!checksByContentId[check.contentId]) {
              checksByContentId[check.contentId] = [];
            }
            checksByContentId[check.contentId].push(check);
          } else {
            unassociatedChecks.push(check);
          }
        });
        
        // Build unified items array: each content item followed by its knowledge checks
        const items = [];
        const sortedContent = [...contentItems].sort((a, b) => a.ContentID - b.ContentID);
        
        sortedContent.forEach(content => {
          items.push({
            id: `content-${content.ContentID}`,
            type: 'content',
            contentId: content.ContentID,
            overview: content.Overview,
            reading: content.Reading,
            image: content.ImageURL,
            imageDescription: content.ImageDescription
          });
          
          // Insert knowledge checks associated with this content item
          const associatedChecks = checksByContentId[content.ContentID] || [];
          associatedChecks.forEach(check => {
            items.push({
              id: `check-${check.knowledgeCheckId}`,
              type: 'knowledgeCheck',
              knowledgeCheckId: check.knowledgeCheckId,
              question: check.question,
              choices: parseChoices(check.choices),
              answer: check.answer?.trim(),
              explain: check.explain,
              allowance: check.allowance,
              contentId: check.contentId
            });
          });
        });
        
        // Append any knowledge checks not linked to a specific content item
        unassociatedChecks.forEach(check => {
          items.push({
            id: `check-${check.knowledgeCheckId}`,
            type: 'knowledgeCheck',
            knowledgeCheckId: check.knowledgeCheckId,
            question: check.question,
            choices: parseChoices(check.choices),
            answer: check.answer?.trim(),
            explain: check.explain,
            allowance: check.allowance,
            contentId: check.contentId
          });
        });
        
        setAllItems(items);
        
        const currentModule = allModules.length > 0 ? allModules.find(m => m.ModuleID === parseInt(moduleNum)) : null;
        if (currentModule) {
          setModuleHeading(currentModule.Heading || `Module ${moduleNum}`);
          setModuleSubheading(currentModule.Subheading || '');
        } else {
          setModuleHeading(`Module ${moduleNum}`);
          setModuleSubheading('');
        }
        
        // Set current item based on URL or first item
        const itemToShow = currentItemId
          ? items.find(item => item.id === currentItemId)
          : items[0];
        setCurrentItem(itemToShow || items[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadContent();
  }, [moduleId, currentItemId]);

  // Update module heading when allModules loads
  useEffect(() => {
    if (allModules.length > 0 && moduleId) {
      const moduleNum = moduleId.replace('module', '');
      const currentModule = allModules.find(m => m.ModuleID === parseInt(moduleNum));
      if (currentModule) {
        setModuleHeading(currentModule.Heading || `Module ${moduleNum}`);
        setModuleSubheading(currentModule.Subheading || '');
      }
    }
  }, [allModules, moduleId]);

  // Track item view (with deduplication)
  const trackItemView = useCallback(async (itemId) => {
    if (!user || !itemId) return;
    
    const trackingKey = `${moduleId}-${itemId}`;
    if (trackedViews.current.has(trackingKey) || trackingInProgress.current) {
      return;
    }
    
    trackingInProgress.current = true;
    trackedViews.current.add(trackingKey);
    
    try {
      const item = allItems.find(i => i.id === itemId);
      const contentId = item?.type === 'content' 
        ? item.contentId 
        : item?.knowledgeCheckId || itemId;
      
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
      console.error('Failed to track item view:', error);
      trackedViews.current.delete(trackingKey);
    } finally {
      trackingInProgress.current = false;
    }
  }, [user, moduleId, allItems]);

  // Track knowledge check completion
  const trackKnowledgeCheckCompletion = useCallback(async (knowledgeCheckId) => {
    if (!user || !knowledgeCheckId) return;
    
    const completionKey = `${moduleId}-check-${knowledgeCheckId}`;
    if (completedItems.current.has(completionKey)) {
      return;
    }
    
    completedItems.current.add(completionKey);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: moduleId.replace('module', ''),
          action: 'complete',
          contentId: knowledgeCheckId
        })
      });
    } catch (error) {
      console.error('Failed to track knowledge check completion:', error);
      completedItems.current.delete(completionKey);
    }
  }, [user, moduleId]);

  // Track module completion
  const trackModuleCompletion = useCallback(async () => {
    if (!user) return;
    
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
      completedModules.current.delete(moduleId);
    }
  }, [user, moduleId]);

  const handleSidebarClick = (itemId) => {
    router.push(`/modules/${moduleId}?item=${itemId}`);
    // Close mobile sidebar after clicking
    setSidebarOpen(false);
    // Don't track here - let the useEffect handle it to avoid duplicates
  };

  const handleOptionClick = useCallback((knowledgeCheckId, letter, correctAnswer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [knowledgeCheckId]: letter
    }));
    
    // Track completion if answer is correct
    if (letter === correctAnswer && user) {
      trackKnowledgeCheckCompletion(knowledgeCheckId);
    }
  }, [user, trackKnowledgeCheckCompletion]);

  const handleDescriptiveSubmit = useCallback((knowledgeCheckId, answerText) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [knowledgeCheckId]: '__submitted__'
    }));
    setDescriptiveAnswers(prev => ({
      ...prev,
      [knowledgeCheckId]: answerText
    }));
    if (user) {
      trackKnowledgeCheckCompletion(knowledgeCheckId);
    }
  }, [user, trackKnowledgeCheckCompletion]);

  // Track item view when current item changes
  useEffect(() => {
    if (currentItem?.id && user) {
      trackItemView(currentItem.id);
    }
  }, [currentItem?.id, user, trackItemView]);

  const handleNext = () => {
    const currentIndex = allItems.findIndex(item => item.id === currentItem?.id);
    if (currentIndex < allItems.length - 1) {
      const nextItem = allItems[currentIndex + 1];
      handleSidebarClick(nextItem.id);
    }
  };

  const handlePrev = () => {
    const currentIndex = allItems.findIndex(item => item.id === currentItem?.id);
    if (currentIndex > 0) {
      const prevItem = allItems[currentIndex - 1];
      handleSidebarClick(prevItem.id);
    }
  };

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

  if (!allItems.length) {
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

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading content...</p>
      </div>
    );
  }

  const currentIndex = allItems.findIndex(item => item.id === currentItem.id);
  const isLastItem = currentIndex === allItems.length - 1;
  const isKnowledgeCheck = currentItem.type === 'knowledgeCheck';
  const isDescriptive = isKnowledgeCheck && (!currentItem.choices || currentItem.choices.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-black hover:text-green-700 transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-black truncate">{moduleSubheading || moduleHeading}</h2>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-72 max-w-[85vw] bg-white border-r border-gray-200 shadow-xl fixed left-0 top-0 h-screen flex flex-col overflow-hidden z-50 transition-transform duration-300 ease-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } lg:w-64 lg:shadow-sm`}>
        {/* Sidebar Header */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-white border-b border-gray-200">
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between mb-3">
            <Link 
              href="/training-module" 
              className="flex items-center gap-1.5 text-green-700 hover:text-green-800 text-sm font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Modules
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 -mr-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Desktop Back Link */}
          <Link href="/training-module" className="hidden lg:inline-flex items-center text-green-700 hover:text-green-800 mb-4 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Modules
          </Link>
          
          <h2 className="text-lg font-bold text-green-700">{moduleHeading}</h2>
          {moduleSubheading && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{moduleSubheading}</p>
          )}
        </div>
        
        <nav className="flex-1 flex flex-col overflow-y-auto p-3">
          <div className="space-y-1.5 flex-1">
            {allItems.map((item, index) => {
              const isActive = currentItem.id === item.id;
              const isCompleted = index < currentIndex;
              const displayNumber = index + 1;
              
              let title = `Item ${displayNumber}`;
              if (item.type === 'content') {
                title = item.overview || `Section ${displayNumber}`;
              } else if (item.type === 'knowledgeCheck') {
                title = `Knowledge Check`;
              }
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSidebarClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-green-100 text-green-700 font-semibold border-l-4 border-green-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted && !isActive ? '✓' : displayNumber}
                    </span>
                    <span className="text-sm truncate flex-1">{title}</span>
                    {item.type === 'knowledgeCheck' && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Quiz</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Track Progress Button */}
          <div className="pt-4 border-t border-gray-200 pb-2 px-1">
            <button
              onClick={() => {
                setSidebarOpen(false);
                router.push('/#course-modules');
              }}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg text-sm"
            >
              Track Progress
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
          {/* Content Display */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 lg:p-8 mb-4 sm:mb-8">
            {currentItem.type === 'content' && (
              <div className="space-y-6">
                {currentItem.overview && (
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {currentItem.overview}
                  </h3>
                )}
                {currentItem.image && (
                  <div className="flex justify-center items-center">
                    <img
                      src={currentItem.image}
                      alt={currentItem.imageDescription || currentItem.overview || 'Module content'}
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                {currentItem.reading && (
                  <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {currentItem.reading}
                  </div>
                )}
                {!currentItem.overview && !currentItem.reading && !currentItem.image && (
                  <div className="text-center text-gray-500 p-8">
                    <p>No content available for this section.</p>
                  </div>
                )}
              </div>
            )}

            {currentItem.type === 'knowledgeCheck' && (
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {currentItem.question || 'Question not available'}
                  </h3>
                  
                  {/* Allowance (discussion prompt) */}
                  {currentItem.allowance && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                      <p className="text-sm text-blue-800 font-medium">
                        💬 {currentItem.allowance}
                      </p>
                    </div>
                  )}
                </div>

                {/* Choices */}
                {(currentItem.choices && currentItem.choices.length > 0) ? (
                <ul className="space-y-2 sm:space-y-3">
                  {currentItem.choices.map((option, idx) => {
                    const isSelected = selectedAnswers[currentItem.knowledgeCheckId] === option.letter;
                    const isCorrect = currentItem.answer === option.letter;
                    const showFeedback = selectedAnswers[currentItem.knowledgeCheckId] !== undefined;
                    
                    return (
                      <li
                        key={idx}
                        className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          !showFeedback
                            ? 'border-gray-300 hover:border-green-400 bg-white hover:bg-green-50'
                            : isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 bg-white opacity-60'
                        }`}
                        onClick={() => handleOptionClick(
                          currentItem.knowledgeCheckId, 
                          option.letter, 
                          currentItem.answer
                        )}
                      >
                        <div className="flex items-start">
                          {showFeedback && isCorrect && (
                            <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl flex-shrink-0">✓</span>
                          )}
                          {showFeedback && isSelected && !isCorrect && (
                            <span className="text-red-600 mr-2 sm:mr-3 text-lg sm:text-xl flex-shrink-0">✗</span>
                          )}
                          <span className="font-semibold text-gray-800 mr-2">
                            {option.letter}:
                          </span>
                          <span className="text-sm sm:text-base text-gray-800">{option.text}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                ) : isDescriptive ? (
                  <div className="space-y-4">
                    <textarea
                      value={descriptiveAnswers[currentItem.knowledgeCheckId] ?? ''}
                      onChange={(e) => setDescriptiveAnswers(prev => ({
                        ...prev,
                        [currentItem.knowledgeCheckId]: e.target.value
                      }))}
                      placeholder="Type your answer here..."
                      rows={5}
                      disabled={selectedAnswers[currentItem.knowledgeCheckId] === '__submitted__'}
                      className="w-full min-h-[120px] p-3 sm:p-4 border-2 border-gray-300 rounded-lg bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all resize-y text-gray-800 disabled:bg-gray-50 disabled:opacity-60"
                    />
                    {selectedAnswers[currentItem.knowledgeCheckId] !== '__submitted__' ? (
                      <button
                        onClick={() => handleDescriptiveSubmit(
                          currentItem.knowledgeCheckId,
                          descriptiveAnswers[currentItem.knowledgeCheckId] ?? ''
                        )}
                        disabled={!(descriptiveAnswers[currentItem.knowledgeCheckId]?.trim())}
                        className="px-6 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    ) : descriptiveAnswers[currentItem.knowledgeCheckId] && (
                      <div className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded">
                        <h4 className="font-semibold text-gray-800 mb-2">Your answer:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{descriptiveAnswers[currentItem.knowledgeCheckId]}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    <p>No choices available for this question.</p>
                  </div>
                )}

                {/* Explanation (shown after answer) */}
                {selectedAnswers[currentItem.knowledgeCheckId] !== undefined && currentItem.explain && (
                  <div className="mt-6 p-6 bg-green-50 border-l-4 border-green-500 rounded">
                    <h4 className="font-semibold text-green-800 mb-2">Explanation:</h4>
                    <p className="text-green-700">{currentItem.explain}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-2 sm:gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  currentIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <span className="hidden sm:inline">← Previous</span>
                <span className="sm:hidden">←</span>
              </button>
              
              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                {currentIndex + 1} of {allItems.length}
              </span>
              
              {isLastItem ? (
                <button
                  onClick={() => {
                    if (currentItem.type === 'content') {
                      trackModuleCompletion();
                    }
                  }}
                  className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-green-600 text-white hover:bg-green-700"
                >
                  <span className="hidden sm:inline">View results</span>
                  <span className="sm:hidden">View results</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-green-600 text-white hover:bg-green-700"
                >
                  <span className="hidden sm:inline">Next →</span>
                  <span className="sm:hidden">→</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
