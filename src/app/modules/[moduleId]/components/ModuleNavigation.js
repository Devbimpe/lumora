'use client';

import Link from 'next/link';

export default function ModuleNavigation({
  currentIndex,
  totalItems,
  showModuleComplete,
  hasNextPublishedModule,
  onPrev,
  onNext,
  onGoToNextModule,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-2 sm:gap-4">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            currentIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <span className="hidden sm:inline">&larr; Previous</span>
          <span className="sm:hidden">&larr;</span>
        </button>
        <span className="text-xs sm:text-sm text-gray-600 font-medium">
          {currentIndex + 1} of {totalItems}
        </span>
        {!showModuleComplete && (
          <button
            onClick={onNext}
            disabled={currentIndex === totalItems - 1}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              currentIndex === totalItems - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <span className="hidden sm:inline">Next &rarr;</span>
            <span className="sm:hidden">&rarr;</span>
          </button>
        )}
      </div>

      {showModuleComplete && (
        <div className="mt-4 p-4 sm:p-6 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="text-center">
            <p className="text-base sm:text-lg font-semibold text-green-700 mb-2">
              🎉 Congratulations! You&apos;ve completed this module!
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              {hasNextPublishedModule
                ? 'Ready to continue your learning journey?'
                : 'Great work finishing this module!'}
            </p>
            {hasNextPublishedModule ? (
              <button
                type="button"
                onClick={onGoToNextModule}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Go to Next Module &rarr;
              </button>
            ) : (
              <Link
                href="/training-module"
                className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Exit
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
