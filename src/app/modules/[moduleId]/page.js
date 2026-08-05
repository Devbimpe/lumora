'use client';
import { Suspense, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '../Module.css';
import { useAuth } from '@/app/components/AuthProvider';
import { api, apiErrorMessage } from '@/app/_lib/api-client';
import { findFirstIncompleteItem } from './utils';
import { compareModulesBySortOrder } from '@/app/_db/common';
import ModuleMobileHeader from './components/ModuleMobileHeader';
import ModuleSidebar from './components/ModuleSidebar';
import ContentItemView from './components/ContentItemView';
import KnowledgeCheckView from './components/KnowledgeCheckView';

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
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [openEndedAnswers, setOpenEndedAnswers] = useState({});
  const [aiFeedbackByCheck, setAiFeedbackByCheck] = useState({});
  const [savedKnowledgeCheckSubmissions, setSavedKnowledgeCheckSubmissions] = useState({});
  const [persistedCompletedContent, setPersistedCompletedContent] = useState([]);
  const [persistedViewedContent, setPersistedViewedContent] = useState([]);
  const [moduleProgressHydrated, setModuleProgressHydrated] = useState(false);
  const [submittedViewAnimate, setSubmittedViewAnimate] = useState(false);
  const [progress, setProgress] = useState(null);

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

  const { nextModule, prevModule } = useMemo(() => {
    const currentModuleIdNum = parseInt(moduleId.replace('module', ''), 10);
    const sorted = [...allModules].sort(compareModulesBySortOrder);
    const idx = sorted.findIndex(m => Number(m.ModuleID ?? m.moduleId) === currentModuleIdNum);
    return {
      nextModule: idx >= 0 ? sorted[idx + 1] : null,
      prevModule: idx >= 0 ? sorted[idx - 1] : null,
    };
  }, [allModules, moduleId]);

  // Get current item ID from URL
  const currentItemId = searchParams.get('item') || searchParams.get('page') || null;

  // Fetch all modules only once on mount (for navigation)
  useEffect(() => {
    if (allModulesFetched.current) return;
    
    async function fetchAllModules() {
      try {
        const data = await api.get('/api/modules').json();
        setAllModules(data);
        allModulesFetched.current = true;
      } catch (err) {
        console.error('Failed to fetch modules:', err);
      }
    }
    
    fetchAllModules();
  }, []); // Only run once on mount

  // Load content and knowledge checks when moduleId changes
  useEffect(() => {
    setLoading(true);
    
    async function loadContent() {
      try {
        const moduleNum = moduleId.replace('module', '');

        // Map a raw KC doc (typed by `type`) into the unified `allItems` view model.
        // `allItems` uses `type` for content-vs-knowledgeCheck, so the MC/open-ended
        // discriminator is carried as `kcType`.
        const toKcItem = (check) => ({
          id: `kc-${check.knowledgeCheckId}`,
          type: 'knowledgeCheck',
          knowledgeCheckId: check.knowledgeCheckId,
          kcType: check.type,
          question: check.question,
          explanation: check.explanation,
          contentId: check.contentId,
          sectionId: check.sectionId ?? null,
          moduleID: check.moduleID,
          aiGradingEnabled: check.aiGradingEnabled,
          ...(check.type === 'multiple-choice'
            ? { choices: Array.isArray(check.choices) ? check.choices : [], correctAnswer: check.correctAnswer }
            : { rubric: check.rubric, gradingContext: check.gradingContext }),
        });
        
        // Fetch content, knowledge checks, and module details in parallel. Content and
        // knowledge checks are required for a usable module page; module details are best-effort.
        const [contentResult, checksResult, moduleResult, sectionsResult] = await Promise.allSettled([
          api.get(`/api/content?moduleId=${moduleNum}`).json(),
          api.get(`/api/knowledge-checks?moduleId=${moduleNum}`).json(),
          api.get(`/api/Module?moduleId=${moduleNum}`).json(),
          api.get(`/api/sections?moduleId=${moduleNum}`).json(),
        ]);

        if (contentResult.status !== 'fulfilled') {
          throw new Error('Failed to load module content');
        }
        if (checksResult.status !== 'fulfilled') {
          throw new Error('Failed to load knowledge checks');
        }

        const contentItems = contentResult.value;
        const knowledgeChecks = checksResult.value;
        const sections = sectionsResult.status === 'fulfilled' && Array.isArray(sectionsResult.value) ? sectionsResult.value : [];

        let moduleDetails = null;
        if (moduleResult.status === 'fulfilled') {
          const moduleRows = moduleResult.value;
          if (Array.isArray(moduleRows) && moduleRows.length > 0) {
            moduleDetails = {
              heading: moduleRows[0]?.Heading,
              subheading: moduleRows[0]?.Subheading
            };
          }
        }
        
        const toContentItem = (content) => ({
          id: `content-${content.ContentID}`,
          type: 'content',
          contentId: content.ContentID,
          sectionId: content.sectionId ?? content.SectionID ?? null,
          overview: content.Overview,
          reading: content.Reading,
          image: content.ImageURL,
          imageDescription: content.ImageDescription,
        });

        const items = [];
        const sortedContent = [...contentItems].sort((a, b) => a.ContentID - b.ContentID);
        const sortedSections = [...sections].sort((a, b) => {
          const aOrder = Number(a.sortOrder ?? a.sectionId ?? 0);
          const bOrder = Number(b.sortOrder ?? b.sectionId ?? 0);
          return aOrder - bOrder;
        });

        if (sortedSections.length > 0) {
          sortedSections.forEach((section, index) => {
            const sectionId = Number(section.sectionId);

            items.push({
            id: `section-${sectionId}`,
            type: 'sectionIntro',
            sectionId,
            title: section.title,
            description: section.description,
            sectionNumber: index + 1,
          });

          sortedContent
            .filter((content) => Number(content.sectionId ?? content.SectionID) === sectionId)
            .forEach((content) => {
              items.push(toContentItem(content));
            });

          knowledgeChecks
            .filter((check) => Number(check.sectionId) === sectionId)
            .forEach((check) => {
              items.push(toKcItem(check));
            });
        });

        sortedContent
          .filter((content) => content.sectionId == null && content.SectionID == null)
          .forEach((content) => {
            items.push(toContentItem(content));
          });

        knowledgeChecks
          .filter((check) => check.sectionId == null && check.contentId == null)
          .forEach((check) => {
            items.push(toKcItem(check));
          });
      } else {
        const checksByContentId = {};
        const unassociatedChecks = [];

        knowledgeChecks.forEach((check) => {
          if (check.contentId != null) {
            if (!checksByContentId[check.contentId]) {
              checksByContentId[check.contentId] = [];
            }

            checksByContentId[check.contentId].push(check);
          } else {
            unassociatedChecks.push(check);
          }
        });

        sortedContent.forEach((content) => {
          items.push(toContentItem(content));

          const associatedChecks = checksByContentId[content.ContentID] || [];
          associatedChecks.forEach((check) => {
            items.push(toKcItem(check));
          });
        });

        unassociatedChecks.forEach((check) => {
            items.push(toKcItem(check));
        });
      }

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
    if (!user?.uid || !moduleId) {
      setModuleProgressHydrated(false);
      return;
    }
    const moduleNum = moduleId.replace('module', '');
    let cancelled = false;
    setModuleProgressHydrated(false);
    setSavedKnowledgeCheckSubmissions({});
    setPersistedCompletedContent([]);
    setPersistedViewedContent([]);
    (async () => {
      try {
        const progress = await api.get(`/api/progress?userId=${user.uid}&moduleId=${moduleNum}`).json();
        
        if (!cancelled) {
          setProgress(progress);
          setSavedKnowledgeCheckSubmissions(progress?.knowledgeCheckSubmissions || {});
          setPersistedCompletedContent(Array.isArray(progress?.completedContent) ? progress.completedContent : []);
          setPersistedViewedContent(Array.isArray(progress?.viewedContent) ? progress.viewedContent : []);
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to load module progress:', err);
      } finally {
        if (!cancelled) setModuleProgressHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid, moduleId]);

  const persistedCompletedContentSet = useMemo(
    () => new Set((persistedCompletedContent || []).map(value => String(value))),
    [persistedCompletedContent]
  );

  const persistedViewedContentSet = useMemo(
    () => new Set((persistedViewedContent || []).map(value => String(value))),
    [persistedViewedContent]
  );

  // persist all answers (mc, open-ended)
  useEffect(() => {
      if (!moduleProgressHydrated) return;

      setSelectedAnswers(prev => {
        const next = { ...prev };
        let changed = false;

        for (const [kcId, submission] of Object.entries(savedKnowledgeCheckSubmissions)) {
          const ans = submission?.userAnswer;

          if (typeof ans === 'number' && next[kcId] === undefined) {
            next[kcId] = ans; // MC wrong or right
            changed = true;
          }

          if (typeof ans === 'string' && next[kcId] === undefined) {
            next[kcId] = '__submitted__'; // open-ended submitted
            changed = true;
          }
        }

        return changed ? next : prev;
      });

      setOpenEndedAnswers(prev => {
        const next = { ...prev };
        let changed = false;

        for (const [kcId, submission] of Object.entries(savedKnowledgeCheckSubmissions)) {
          const ans = submission?.userAnswer;

          if (typeof ans === 'string' && !next[kcId]) {
            next[kcId] = ans;
            changed = true;
          }
        }

      return changed ? next : prev;
    });
  }, [moduleProgressHydrated, savedKnowledgeCheckSubmissions]);

  // Logged-in users: open module at first incomplete item when URL has no ?item= (resume)

 useEffect(() => {
    if (!user?.uid || !moduleId || loading || !moduleProgressHydrated || !allItems.length) return;

    const hydrated =
      Object.keys(selectedAnswers).length > 0 ||
      Object.keys(openEndedAnswers).length > 0 ||
      Object.keys(savedKnowledgeCheckSubmissions).length > 0;

    if (!hydrated) return;

    if (currentItemId) return;

    const firstIncomplete = findFirstIncompleteItem(
      allItems,
      new Set(persistedViewedContent.map(String)),
      new Set(persistedCompletedContent.map(String)),
      savedKnowledgeCheckSubmissions,
      selectedAnswers
    );

    const target = firstIncomplete || allItems[0];
    router.replace(`/modules/${moduleId}?item=${encodeURIComponent(target.id)}`);
  }, [
    user?.uid,
    moduleId,
    loading,
    moduleProgressHydrated,
    allItems,
    currentItemId,
    selectedAnswers,
    openEndedAnswers,
    savedKnowledgeCheckSubmissions,
    persistedViewedContent,
    persistedCompletedContent,
    router,
  ]);

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

  // Two dedup guards, each covering a different case:
  //  - trackedViews (Set): an item is tracked at most once per session.
  //  - trackingInProgress (mutex): no second track call runs while an async
  //    request is in flight. On failure the Set entry is removed so the view
  //    can be retried, which is why the Set alone isn't sufficient.
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
      
      await api.post('/api/progress', {
        json: {
          userId: user.uid,
          moduleId: moduleId.replace('module', ''),
          action: 'view',
          contentId: contentId
        }
      });
      const idStr = String(contentId);
      setPersistedViewedContent((prev) =>
        prev.some((id) => String(id) === idStr) ? prev : [...prev, contentId]
      );
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
      await api.post('/api/progress', {
        json: {
          userId: user.uid,
          moduleId: moduleId.replace('module', ''),
          action: 'complete',
          contentId: `kc-${knowledgeCheckId}`
        }
      });
      const kcId = `kc-${knowledgeCheckId}`;
      setPersistedCompletedContent((prev) =>
        prev.some((id) => String(id) === kcId) ? prev : [...prev, kcId]
      );
      setPersistedViewedContent((prev) =>
        prev.some((id) => String(id) === kcId) ? prev : [...prev, kcId]
      );
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
      await api.post('/api/progress', {
        json: {
          userId: user.uid,
          moduleId: moduleId.replace('module', ''),
          action: 'completeModule'
        }
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

  const handleOptionClick = useCallback(
    async (knowledgeCheckId, index, correctIndex) => {
      setSelectedAnswers(prev => ({
        ...prev,
        [knowledgeCheckId]: index
      }));

      if (user) {
        try {
          await api.post('/api/progress', {
            json: {
              userId: user.uid,
              moduleId: moduleId.replace('module', ''),
              action: 'saveKnowledgeCheckFeedback',
              contentId: knowledgeCheckId,
              userAnswer: index,
              aiGradingEnabled: false, // or true if you later add AI grading for MC
            },
          });

          setSavedKnowledgeCheckSubmissions(prev => ({
            ...prev,
            [knowledgeCheckId]: {
              ...(prev[knowledgeCheckId] || {}),
              userAnswer: index,
            },
          }));
        } catch (err) {
          console.error('Failed to save MC answer to progress:', err);
        }
      }
    
      // Track completion if answer is correct
     if (user) {
      trackKnowledgeCheckCompletion(knowledgeCheckId);
    }

  }, [user, trackKnowledgeCheckCompletion]
);

  const handleOpenEndedSubmit = useCallback(async (knowledgeCheckId, answerText, token) => {
    // Find the knowledge check details so we can send full context to the grader
    const item = allItems.find(
      (i) => i.type === 'knowledgeCheck' && i.knowledgeCheckId === knowledgeCheckId
    );

    if (!item) {
      return;
    }

    if (item.aiGradingEnabled && !token) {
      console.warn('AI grading is enabled but captcha has not been solved');
      return;
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [knowledgeCheckId]: '__submitted__'
    }));
    setOpenEndedAnswers(prev => ({
      ...prev,
      [knowledgeCheckId]: answerText
    }));

    if (user) {
      trackKnowledgeCheckCompletion(knowledgeCheckId);
    }

    // Non-AI-graded: skip the grader, save answer-only, show explanation.
    if (!item.aiGradingEnabled) {
      setAiFeedbackByCheck(prev => ({
        ...prev,
        [knowledgeCheckId]: {
          loading: false,
          error: null,
          aiGradingEnabled: false,
        }
      }));

      if (user) {
        try {
          await api.post('/api/progress', {
            json: {
              userId: user.uid,
              moduleId: moduleId.replace('module', ''),
              action: 'saveKnowledgeCheckFeedback',
              contentId: knowledgeCheckId,
              userAnswer: answerText,
              aiGradingEnabled: false,
            }
          });
          setSavedKnowledgeCheckSubmissions(prev => ({
            ...prev,
            [knowledgeCheckId]: {
              userAnswer: answerText,
              grade: null,
              feedback: null,
              aiGradingEnabled: false,
            }
          }));
        } catch (saveErr) {
          console.error('Failed to save knowledge check submission to progress:', saveErr);
        }
      }
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

      const data = await api.post('/api/grade-knowledge-check', {
        json: {
          moduleID: item.moduleID,
          knowledgeCheckId: item.knowledgeCheckId,
          userAnswer: answerText,
          token,
        }
      }).json();

      // Display/storage uses a 0-100 percentage for now (matches the existing feedback
      // card and progress dashboard); the grader emits a raw 0..maxGrade integer, so
      // normalize here. maxGrade is also stored so a future switch to raw scores is easy.
      const pct = data.maxGrade > 0 ? Math.round((data.score / data.maxGrade) * 100) : 0;

      setAiFeedbackByCheck(prev => ({
        ...prev,
        [knowledgeCheckId]: {
          ...(prev[knowledgeCheckId] || {}),
          loading: false,
          error: null,
          Grade: pct,
          Feedback: data.feedback,
          maxGrade: data.maxGrade,
        }
      }));

      // Save user answer and AI feedback to module progress (overwrites on reattempt)
      if (user) {
        try {
          await api.post('/api/progress', {
            json: {
              userId: user.uid,
              moduleId: moduleId.replace('module', ''),
              action: 'saveKnowledgeCheckFeedback',
              contentId: knowledgeCheckId,
              userAnswer: answerText,
              grade: pct,
              feedback: data.feedback,
              maxGrade: data.maxGrade,
              model: data.model,
            }
          });
          setSavedKnowledgeCheckSubmissions(prev => ({
            ...prev,
            [knowledgeCheckId]: {
              userAnswer: answerText,
              grade: pct,
              feedback: data.feedback,
              maxGrade: data.maxGrade,
            }
          }));
        } catch (saveErr) {
          console.error('Failed to save knowledge check feedback to progress:', saveErr);
        }
      }
    } catch (err) {
      console.error('Failed to grade knowledge check:', err);
      const message = await apiErrorMessage(err, 'Unable to retrieve AI feedback right now.');
      setAiFeedbackByCheck(prev => ({
        ...prev,
        [knowledgeCheckId]: {
          ...(prev[knowledgeCheckId] || {}),
          loading: false,
          error: message,
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

  const handleGoToNextModule = () => {
    if (!nextModule) return;
    router.push(`/modules/module${nextModule.ModuleID ?? nextModule.moduleId}`);
  };

  const handleGoToPrevModule = () => {
    if (!prevModule) return;
    router.push(`/modules/module${prevModule.ModuleID ?? prevModule.moduleId}`);
  };

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
        savedKnowledgeCheckSubmissions={savedKnowledgeCheckSubmissions}
        persistedCompletedContentSet={persistedCompletedContentSet}
        persistedViewedContentSet={persistedViewedContentSet}
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
            
            {currentItem.type === 'sectionIntro' && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm font-semibold text-green-700 mb-3">
                  Section {currentItem.sectionNumber}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {currentItem.title}
                </h2>
                {currentItem.description && (
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto whitespace-pre-wrap">
                    {currentItem.description}
                  </p>
                )}
              </div>
            )}

            {currentItem.type === 'content' && <ContentItemView item={currentItem} />}
            {currentItem.type === 'knowledgeCheck' && (
              <KnowledgeCheckView
                item={currentItem}
                selectedAnswers={selectedAnswers}
                openEndedAnswers={openEndedAnswers}
                savedKnowledgeCheckSubmissions={savedKnowledgeCheckSubmissions}
                aiFeedbackByCheck={aiFeedbackByCheck}
                submittedViewAnimate={submittedViewAnimate}
                onOptionClick={handleOptionClick}
                onOpenEndedAnswerChange={(id, value) => setOpenEndedAnswers(prev => ({ ...prev, [id]: value }))}
                onOpenEndedSubmit={handleOpenEndedSubmit}
              />
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
                  onClick={async () => {
                    await trackModuleCompletion();
                    setTimeout(() => {
                      router.push(`/user-progress?modId=${moduleId.replace('module', '')}`);
                    }, 1000)
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

            <div className="flex justify-between items-center gap-2 sm:gap-4 pt-2 border-t border-gray-100">
              <button
                onClick={handleGoToPrevModule}
                disabled={!prevModule}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                  !prevModule
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-green-700 border border-green-600 hover:bg-green-50'
                }`}
              >
                <span className="hidden sm:inline">← Previous module</span>
                <span className="sm:hidden">← Module</span>
              </button>

              <button
                onClick={handleGoToNextModule}
                disabled={!nextModule}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                  !nextModule
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-green-700 border border-green-600 hover:bg-green-50'
                }`}
              >
                <span className="hidden sm:inline">Next module →</span>
                <span className="sm:hidden">Module →</span>
              </button>
            </div>
          </div>

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
