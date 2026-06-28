'use client';

import AIFeedbackCard from './AIFeedbackCard';

export default function OpenEndedAnswerBlock({ userAnswer, aiFeedback, animate }) {
  return (
    <div
      className={`transition-all duration-300 ease-out ${
        animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-start gap-0 -mt-2 ml-1 mb-3 sm:mb-6 lg:mb-8">
        <div className="w-6 flex flex-col flex-shrink-0" aria-hidden="true">
          <div className="h-3 w-full border-l-2 border-b-2 border-gray-300 rounded-bl-lg" />
        </div>
        <div className="flex-1 min-w-0 pl-2.5 -mt-1">
          <p className="text-gray-600 text-base sm:text-lg font-medium whitespace-pre-wrap">
            &ldquo;{userAnswer}&rdquo;
          </p>
        </div>
      </div>
      {aiFeedback && (
        <AIFeedbackCard
          loading={aiFeedback.loading}
          error={aiFeedback.error}
          grade={aiFeedback.Grade}
          feedback={aiFeedback.Feedback}
          variant="current"
        />
      )}
    </div>
  );
}
