'use client';

export default function KCReadView({ kc, index }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Check {index + 1}</span>
            {kc.type === 'open-ended' && (
              <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">Open-ended</span>
            )}
            {kc.type === 'multiple-choice' && (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Multiple Choice</span>
            )}
            <span className="text-xs sm:text-sm text-gray-500">Module {kc.moduleID}</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{kc.question}</h3>
        </div>
      </div>

      {kc.type === 'open-ended' ? (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-purple-400">
          <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Sample Answer:</h4>
          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
            {kc.sampleAnswer || <span className="italic text-gray-400">No sample answer provided</span>}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
          <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Choices:</h4>
          <ul className="space-y-1">
            {(Array.isArray(kc.choices) ? kc.choices : []).map((choice, i) => (
              <li key={i} className="text-xs sm:text-sm text-gray-700">
                {String.fromCharCode(65 + i)}: {choice}
                {typeof kc.correctAnswer === 'number' && kc.correctAnswer === i && (
                  <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                )}
              </li>
            ))}
          </ul>
          {kc.explanation && (
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Explanation:</span> {kc.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
