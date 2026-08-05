'use client';

import { useRef, useState } from 'react';
import { Turnstile } from '@/app/components/Turnstile';
import OpenEndedAnswerBlock from './OpenEndedAnswerBlock';
import SavedProgressBlock from './SavedProgressBlock';

export default function OpenEndedKnowledgeCheck({
  knowledgeCheckId,
  isSubmitted,
  openEndedAnswer,
  savedSubmission,
  aiFeedback,
  explanation,
  aiGradingEnabled,
  submittedViewAnimate,
  onAnswerChange,
  onSubmit,
}) {
  const turnstile = useRef(null);
  const [token, setToken] = useState(null);

  const displayAnswer = openEndedAnswer ?? savedSubmission?.userAnswer ?? '';
  const trimmedAnswer = displayAnswer.trim();
  const isTooShort = trimmedAnswer.length > 0 && trimmedAnswer.length < 10;
  const canSubmit = trimmedAnswer.length >= 10 && (!aiGradingEnabled || !!token);

  if (isSubmitted) {
    return (
      <OpenEndedAnswerBlock
        userAnswer={displayAnswer}
        aiFeedback={aiFeedback}
        explanation={explanation}
        aiGradingEnabled={aiGradingEnabled}
        animate={submittedViewAnimate}
      />
    );
  }

  return (
    <>
      {savedSubmission && (
        <SavedProgressBlock
          savedSubmission={savedSubmission}
          explanation={explanation}
          aiGradingEnabled={aiGradingEnabled}
        />
      )}
      <textarea
        value={displayAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        rows={5}
        className="w-full min-h-[120px] p-3 sm:p-4 border-2 border-gray-300 rounded-lg bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all resize-y text-gray-800"
      />
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSubmit(trimmedAnswer, token)}
          disabled={!canSubmit}
          className="px-6 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
        {aiGradingEnabled && (
          <Turnstile
            ref={turnstile}
            config={{
              action: 'ai-grading',
              size: 'flexible',
              appearance: 'interaction-only',
              callback: (newToken) => setToken(newToken),
              'expired-callback': () => {
                setToken(null);
                turnstile.current.reset();
              },
            }}
          />
        )}
      </div>
      {isTooShort && (
        <p className="text-sm text-red-600">
          Please write a more complete answer before submitting.
        </p>
      )}
    </>
  );
}
