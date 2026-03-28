'use client';

import AIFeedbackCard from './AIFeedbackCard';
import { normalizeGradeFeedback } from '../utils';

export default function SavedProgressBlock({ savedSubmission }) {
  if (!savedSubmission) return null;
  const { userAnswer, grade, feedback } = savedSubmission;
  const { grade: g, feedback: f } = normalizeGradeFeedback(grade, feedback);
  const hasFeedback = f != null || g != null;

  return (
    <>
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
      {hasFeedback && (
        <AIFeedbackCard
          loading={false}
          error={null}
          grade={grade}
          feedback={feedback}
          variant="previous"
        />
      )}
      <p className="text-xs text-gray-500 mt-3 sm:mt-4">Submit a new answer below to overwrite this saved attempt.</p>
    </>
  );
}
