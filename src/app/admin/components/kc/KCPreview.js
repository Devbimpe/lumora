'use client';

export default function KCPreview({ question, type, choices, correctAnswer, sampleAnswer, explanation }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
      <h4 className="text-sm font-semibold text-gray-600 mb-2">Preview</h4>
      <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 break-words">
        {question || 'No question entered'}
      </h5>

      {type === 'multiple-choice' ? (
        <div className="space-y-2 mb-3">
          {choices.filter((c) => c.trim()).length > 0 ? (
            choices
              .filter((c) => c.trim())
              .map((text, i) => ({ label: String.fromCharCode(65 + i), text, index: i }))
              .map((choice) => {
                const isCorrect = Number(correctAnswer) === choice.index;
                return (
                  <div
                    key={choice.label}
                    className={`p-2 rounded-lg border text-sm ${
                      isCorrect
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`
                  }
                  >
                    <span className="font-medium mr-2">{choice.label}:</span>
                    {choice.text}
                    {isCorrect && (
                      <span className="ml-2 text-green-600 text-xs font-semibold">✓ Correct</span>
                    )}
                  </div>
                );
              })
          ) : (
            <p className="text-sm text-gray-400 italic">No choices added yet</p>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-600 mb-1">Sample Answer:</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
            {sampleAnswer || <span className="italic text-gray-400">No sample answer entered</span>}
          </div>
        </div>
      )}

      {explanation && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Explanation:</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{explanation}</p>
        </div>
      )}
    </div>
  );
}