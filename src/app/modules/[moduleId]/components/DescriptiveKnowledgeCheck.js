'use client';

import DescriptiveAnswerBlock from './DescriptiveAnswerBlock';
import SavedProgressBlock from './SavedProgressBlock';

export default function DescriptiveKnowledgeCheck({
  knowledgeCheckId,
  isSubmitted,
  descriptiveAnswer,
  savedSubmission,
  aiFeedback,
  submittedViewAnimate,
  onAnswerChange,
  onSubmit,
}) {
  const displayAnswer = descriptiveAnswer ?? savedSubmission?.userAnswer ?? '';

  if (isSubmitted) {
    return (
      <DescriptiveAnswerBlock
        userAnswer={displayAnswer}
        aiFeedback={aiFeedback}
        animate={submittedViewAnimate}
      />
    );
  }

  return (
    <>
      {savedSubmission && <SavedProgressBlock savedSubmission={savedSubmission} />}
      <textarea
        value={displayAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        rows={5}
        className="w-full min-h-[120px] p-3 sm:p-4 border-2 border-gray-300 rounded-lg bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all resize-y text-gray-800"
      />
      <button
        onClick={() => onSubmit(displayAnswer.trim())}
        disabled={!displayAnswer?.trim()}
        className="px-6 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Submit Answer
      </button>
    </>
  );
}
