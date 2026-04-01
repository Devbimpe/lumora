'use client';

import Link from 'next/link';

export default function ModuleSidebar({
  allItems,
  currentItem,
  currentIndex,
  moduleHeading,
  moduleSubheading,
  selectedAnswers = {},
  persistedCompletedContentSet = new Set(),
  persistedViewedContentSet = new Set(),
  sidebarOpen,
  onCloseSidebar,
  onItemClick,
  onTrackProgress,
}) {
  return (
    <aside className={`w-72 max-w-[85vw] bg-white border-r border-gray-200 shadow-xl fixed left-0 top-0 h-screen flex flex-col overflow-hidden z-50 transition-transform duration-300 ease-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    } lg:w-64 lg:shadow-sm`}>
      <div className="p-4 bg-gradient-to-r from-green-50 to-white border-b border-gray-200">
        <div className="lg:hidden flex items-center justify-between mb-3">
          <Link
            href="/training-module"
            className="flex items-center gap-1.5 text-green-700 hover:text-green-800 text-sm font-medium"
            onClick={onCloseSidebar}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Modules
          </Link>
          <button
            onClick={onCloseSidebar}
            className="p-2 -mr-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Link href="/training-module" className="hidden lg:inline-flex items-center text-green-700 hover:text-green-800 mb-4 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Contents</p>
        <h2 className="mt-3 text-lg font-bold text-green-700">{moduleHeading}</h2>
      </div>
      <nav className="flex-1 flex flex-col overflow-y-auto p-3">
        <div className="space-y-1.5 flex-1">
          {allItems.map((item, index) => {
            const isActive = currentItem?.id === item.id;
            const isCompleted =
              item.type === 'knowledgeCheck'
                ? (
                    (
                      selectedAnswers[item.knowledgeCheckId] !== undefined &&
                      ((!item.choices || item.choices.length === 0)
                        ? selectedAnswers[item.knowledgeCheckId] === '__submitted__'
                        : selectedAnswers[item.knowledgeCheckId] === item.answer)
                    ) ||
                    persistedCompletedContentSet.has(`kc-${item.knowledgeCheckId}`) ||
                    persistedCompletedContentSet.has(String(item.knowledgeCheckId))
                  )
                : item.type === 'content' &&
                    (index < currentIndex ||
                      (item.contentId != null &&
                        persistedViewedContentSet.has(String(item.contentId))));
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
                onClick={() => onItemClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-green-100 text-green-700 font-semibold border-l-4 border-green-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
                }`}
              >
                <div className="flex items-center">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
                    isActive ? 'bg-green-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
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
        <div className="pt-4 border-t border-gray-200 pb-2 px-1">
          <button
            onClick={onTrackProgress}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg text-sm"
          >
            Track Progress
          </button>
        </div>
      </nav>
    </aside>
  );
}
