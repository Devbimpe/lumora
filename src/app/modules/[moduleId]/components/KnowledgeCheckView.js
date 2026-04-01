'use client';

import MultipleChoiceOptions from './MultipleChoiceOptions';
import DescriptiveKnowledgeCheck from './DescriptiveKnowledgeCheck';
import ExplanationCard from './ExplanationCard';

export default function KnowledgeCheckView({
  item,
  selectedAnswers,
  descriptiveAnswers,
  savedKnowledgeCheckSubmissions,
  aiFeedbackByCheck,
  submittedViewAnimate,
  onOptionClick,
  onDescriptiveAnswerChange,
  onDescriptiveSubmit,
}) {
  const knowledgeCheckId = item.knowledgeCheckId;
  const hasChoices = item.choices && item.choices.length > 0;
  const isDescriptive = !hasChoices;
  const choices = hasChoices ? item.choices : [];
  const selectedAnswer = selectedAnswers[knowledgeCheckId];
  const isSubmitted = selectedAnswer === '__submitted__';
  const hasAnswered = selectedAnswer !== undefined;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {item.question || 'Question not available'}
        </h3>
        {item.allowance && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="text-sm text-blue-800 font-medium">
              💬 {item.allowance}
            </p>
          </div>
        )}
      </div>

      {hasChoices ? (
        <MultipleChoiceOptions
          choices={choices}
          selectedAnswer={selectedAnswer}
          correctAnswer={item.answer}
          onSelect={(letter) => onOptionClick(knowledgeCheckId, letter, item.answer)}
        />
      ) : isDescriptive ? (
        <div className="space-y-4">
          <DescriptiveKnowledgeCheck
            knowledgeCheckId={knowledgeCheckId}
            isSubmitted={isSubmitted}
            descriptiveAnswer={descriptiveAnswers[knowledgeCheckId]}
            savedSubmission={savedKnowledgeCheckSubmissions[knowledgeCheckId]}
            aiFeedback={aiFeedbackByCheck[knowledgeCheckId]}
            submittedViewAnimate={submittedViewAnimate}
            onAnswerChange={(value) => onDescriptiveAnswerChange(knowledgeCheckId, value)}
            onSubmit={(answerText) => onDescriptiveSubmit(knowledgeCheckId, answerText)}
          />
        </div>
      ) : (
        <div className="text-gray-500 text-center p-4">
          <p>No choices available for this question.</p>
        </div>
      )}

      {hasAnswered && item.explain && (
        <ExplanationCard explain={item.explain} />
      )}
    </div>
  );
}
