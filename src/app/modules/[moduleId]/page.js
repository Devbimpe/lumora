'use client';
import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '../Module.css';
import { parseChoices } from './utils';
import ModuleMobileHeader from './components/ModuleMobileHeader';
import ModuleSidebar from './components/ModuleSidebar';
import ContentItemView from './components/ContentItemView';
import KnowledgeCheckView from './components/KnowledgeCheckView';
import ModuleNavigation from './components/ModuleNavigation';

function ModulePageContent() {
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
  const [aiFeedbackByCheck, setAiFeedbackByCheck] = useState({});
  const [savedKnowledgeCheckSubmissions, setSavedKnowledgeCheckSubmissions] = useState({});
  const [submittedViewAnimate, setSubmittedViewAnimate] = useState(false);

  const isSubmittedView = currentItem?.type === 'knowledgeCheck' && selectedAnswers[currentItem.knowledgeCheckId] === '__submitted__';
  useEffect(() => {
    if (isSubmittedView) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSubmittedViewAnimate(true));
      });
      return () => cancelAnimationFrame(id);
    } else {
      setSubmittedViewAnimate(false);
    }
  }, [isSubmittedView]);

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
        
        // Fetch content, knowledge checks, and module details in parallel
        const [contentRes, knowledgeChecksRes, moduleDetailsRes] = await Promise.all([
          fetch(`/api/content?moduleId=${moduleNum}`),
          fetch(`/api/knowledge-checks?moduleId=${moduleNum}`),
          fetch(`/api/Module?moduleId=${moduleNum}`)
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

        let moduleDetails = null;
        if (moduleDetailsRes.ok) {
          try {
            const moduleRows = await moduleDetailsRes.json();
            if (Array.isArray(moduleRows) && moduleRows.length > 0) {
              moduleDetails = {
                heading: moduleRows[0]?.Heading,
                subheading: moduleRows[0]?.Subheading
              };
            }
          } catch (parseError) {
            console.error('Failed to parse module details response:', parseError);
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
        const resolvedHeading = currentModule?.Heading || moduleDetails?.heading || `Module ${moduleNum}`;
        const resolvedSubheading = currentModule?.Subheading || moduleDetails?.subheading || '';
        setModuleHeading(resolvedHeading);
        setModuleSubheading(resolvedSubheading);
        
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

  // Load module progress so we can show saved knowledge check answers and feedback
  useEffect(() => {
    if (!user?.id || !moduleId) return;
    const moduleNum = moduleId.replace('module', '');
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/progress?userId=${user.id}&moduleId=${moduleNum}`);
        if (!res.ok || cancelled) return;
        const progress = await res.json();
        if (!cancelled && progress?.knowledgeCheckSubmissions) {
          setSavedKnowledgeCheckSubmissions(progress.knowledgeCheckSubmissions);
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to load module progress:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, moduleId]);

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
      if (item?.type !== 'content' || item.contentId == null) return;
      const contentId = item.contentId;
      
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
          contentId: `kc-${knowledgeCheckId}`
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

  const handleDescriptiveSubmit = useCallback(async (knowledgeCheckId, answerText) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [knowledgeCheckId]: '__submitted__'
    }));
    setDescriptiveAnswers(prev => ({
      ...prev,
      [knowledgeCheckId]: answerText
    }));

    // Find the knowledge check details so we can send full context to the grader
    const item = allItems.find(
      (i) => i.type === 'knowledgeCheck' && i.knowledgeCheckId === knowledgeCheckId
    );

    if (user) {
      trackKnowledgeCheckCompletion(knowledgeCheckId);
    }

    if (!item) {
      return;
    }

    // Call AI grading endpoint with question, user answer, sample answer, and explanation
    try {
      setAiFeedbackByCheck(prev => ({
        ...prev,
        [knowledgeCheckId]: {
          ...(prev[knowledgeCheckId] || {}),
          loading: true,
          error: null
        }
      }));

      const response = await fetch('/api/grade-knowledge-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: item.question,
          userAnswer: answerText,
          // Backward-compatible: older descriptive checks stored sample answer in `explain`.
          sampleAnswer: item.answer || item.explain || '',
          explanation: item.explain || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to grade knowledge check');
      }

      const data = await response.json();

      setAiFeedbackByCheck(prev => ({
        ...prev,
        [knowledgeCheckId]: {
          ...(prev[knowledgeCheckId] || {}),
          loading: false,
          error: null,
          Grade: data.Grade ?? null,
          Feedback: data.Feedback ?? ''
        }
      }));

      // Save user answer and AI feedback to module progress (overwrites on reattempt)
      if (user) {
        try {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              moduleId: moduleId.replace('module', ''),
              action: 'saveKnowledgeCheckFeedback',
              contentId: knowledgeCheckId,
              userAnswer: answerText,
              grade: data.Grade ?? null,
              feedback: data.Feedback ?? ''
            })
          });
          setSavedKnowledgeCheckSubmissions(prev => ({
            ...prev,
            [knowledgeCheckId]: {
              userAnswer: answerText,
              grade: data.Grade ?? null,
              feedback: data.Feedback ?? ''
            }
          }));
        } catch (saveErr) {
          console.error('Failed to save knowledge check feedback to progress:', saveErr);
        }
      }
    } catch (err) {
      console.error('Failed to grade knowledge check:', err);
      setAiFeedbackByCheck(prev => ({
        ...prev,
        [knowledgeCheckId]: {
          ...(prev[knowledgeCheckId] || {}),
          loading: false,
          error: 'Unable to retrieve AI feedback right now.',
          Grade: null,
          Feedback: ''
        }
      }));
    }
  }, [user, trackKnowledgeCheckCompletion, allItems]);

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

  const handleGoToNextModule = useCallback(() => {
    if (user) {
      trackModuleCompletion();
    }
    
    const currentModuleIdNum = parseInt(moduleId.replace('module', ''), 10);
    const published = allModules.filter(m => m.published);
    const next = published.find(m => m.ModuleID > currentModuleIdNum);
    if (next) {
      router.push(`/modules/module${next.ModuleID}`);
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
  const currentModuleIdNum = parseInt(moduleId.replace('module', ''), 10);
  const publishedModules = allModules.filter(m => m.published);
  const nextModule = publishedModules.find(m => m.ModuleID > currentModuleIdNum);

  const isKnowledgeCheck = currentItem.type === 'knowledgeCheck';
  const isDescriptive = isKnowledgeCheck && (!currentItem.choices || currentItem.choices.length === 0);
  const isKnowledgeCheckAnswered = isKnowledgeCheck && selectedAnswers[currentItem.knowledgeCheckId] !== undefined;
  const isKnowledgeCheckCorrect = isKnowledgeCheck && (
    isDescriptive
      ? selectedAnswers[currentItem.knowledgeCheckId] === '__submitted__'
      : selectedAnswers[currentItem.knowledgeCheckId] === currentItem.answer
  );
  const isLastItemDone = !isKnowledgeCheck || (isKnowledgeCheckAnswered && isKnowledgeCheckCorrect);
  const allKCsCompleted = allItems.every(item => {
    if (item.type !== 'knowledgeCheck') return true;
    const ans = selectedAnswers[item.knowledgeCheckId];
    if (ans === undefined) return false;
    const isDesc = !item.choices || item.choices.length === 0;
    return isDesc ? ans === '__submitted__' : ans === item.answer;
  });
  const showModuleComplete = isLastItem && isLastItemDone && allKCsCompleted;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex">
      <ModuleMobileHeader
        title={moduleSubheading || moduleHeading}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ModuleSidebar
        allItems={allItems}
        currentItem={currentItem}
        currentIndex={currentIndex}
        moduleHeading={moduleHeading}
        moduleSubheading={moduleSubheading}
        selectedAnswers={selectedAnswers}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        onItemClick={handleSidebarClick}
        onTrackProgress={() => {
          setSidebarOpen(false);
          router.push('/#course-modules');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
          {/* Module Heading (static above content) */}
          <div className="mb-4 sm:mb-6 sticky top-14 lg:top-0 z-10 bg-gradient-to-b from-green-50/95 to-white/95 backdrop-blur-sm py-2 sm:py-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
              {moduleHeading}
            </h1>
            {moduleSubheading && (
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 text-center">
                {moduleSubheading}
              </p>
            )}
          </div>

          {/* Content Display */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 lg:p-8 mb-4 sm:mb-8">
            {currentItem.type === 'content' && <ContentItemView item={currentItem} />}
            {currentItem.type === 'knowledgeCheck' && (
              <KnowledgeCheckView
                item={currentItem}
                selectedAnswers={selectedAnswers}
                descriptiveAnswers={descriptiveAnswers}
                savedKnowledgeCheckSubmissions={savedKnowledgeCheckSubmissions}
                aiFeedbackByCheck={aiFeedbackByCheck}
                submittedViewAnimate={submittedViewAnimate}
                onOptionClick={handleOptionClick}
                onDescriptiveAnswerChange={(id, value) => setDescriptiveAnswers(prev => ({ ...prev, [id]: value }))}
                onDescriptiveSubmit={handleDescriptiveSubmit}
              />
            )}
          </div>

          <ModuleNavigation
            currentIndex={currentIndex}
            totalItems={allItems.length}
            showModuleComplete={showModuleComplete}
            hasNextPublishedModule={!!nextModule}
            onPrev={handlePrev}
            onNext={handleNext}
            onGoToNextModule={handleGoToNextModule}
          />
        </div>
      </main>
    </div>
  );
}

export default function ModulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading module content...</p>
      </div>
    }>
      <ModulePageContent />
    </Suspense>
  );
}
