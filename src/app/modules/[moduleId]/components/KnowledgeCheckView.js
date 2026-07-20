'use client';

import MultipleChoiceOptions from './MultipleChoiceOptions';
import OpenEndedKnowledgeCheck from './OpenEndedKnowledgeCheck';
import ExplanationCard from './ExplanationCard';

export default function KnowledgeCheckView({
  item,
  selectedAnswers,
  openEndedAnswers,
  savedKnowledgeCheckSubmissions,
  aiFeedbackByCheck,
  submittedViewAnimate,
  onOptionClick,
  onOpenEndedAnswerChange,
  onOpenEndedSubmit,
}) {
  const knowledgeCheckId = item.knowledgeCheckId;
  const isMultipleChoice = item.kcType === 'multiple-choice';
  const isSubmitted = selectedAnswers[knowledgeCheckId] === '__submitted__';
  const selectedAnswer = selectedAnswers[knowledgeCheckId];
  const hasAnswered = selectedAnswer !== undefined;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {item.question || 'Question not available'}
        </h3>
      </div>

      {isMultipleChoice ? (
        <MultipleChoiceOptions
          choices={item.choices}
          selectedIndex={typeof selectedAnswer === 'number' ? selectedAnswer : undefined}
          correctIndex={item.correctAnswer}
          onSelect={(index) => onOptionClick(knowledgeCheckId, index, item.correctAnswer)}
        />
      ) : (
        <div className="space-y-4">
          <OpenEndedKnowledgeCheck
            knowledgeCheckId={knowledgeCheckId}
            isSubmitted={isSubmitted}
            openEndedAnswer={openEndedAnswers[knowledgeCheckId]}
            savedSubmission={savedKnowledgeCheckSubmissions[knowledgeCheckId]}
            aiFeedback={aiFeedbackByCheck[knowledgeCheckId]}
            explanation={item.explanation}
            aiGradingEnabled={item.aiGradingEnabled}
            submittedViewAnimate={submittedViewAnimate}
            onAnswerChange={(value) => onOpenEndedAnswerChange(knowledgeCheckId, value)}
            onSubmit={(answerText, token) => onOpenEndedSubmit(knowledgeCheckId, answerText, token)}
          />
        </div>
      )}

      {/* Explanation is MC-only (student-facing reveal). Open-ended feedback comes from the AI grader. */}
      {hasAnswered && isMultipleChoice && item.explanation && (
        <ExplanationCard explanation={item.explanation} />
      )}
    </div>
  );
}