'use client';

export default function MultipleChoiceOptions({ choices, selectedAnswer, correctAnswer, onSelect }) {
  const showFeedback = selectedAnswer !== undefined;

  return (
    <ul className="space-y-2 sm:space-y-3">
      {choices.map((option, idx) => {
        const isSelected = selectedAnswer === option.letter;
        const isCorrect = correctAnswer === option.letter;
        return (
          <li
            key={idx}
            className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
              !showFeedback
                ? 'border-gray-300 hover:border-green-400 bg-white hover:bg-green-50'
                : isCorrect
                ? 'border-green-500 bg-green-50'
                : isSelected
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white opacity-60'
            }`}
            onClick={() => onSelect(option.letter)}
          >
            <div className="flex items-start">
              {showFeedback && isCorrect && (
                <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl flex-shrink-0">✓</span>
              )}
              {showFeedback && isSelected && !isCorrect && (
                <span className="text-red-600 mr-2 sm:mr-3 text-lg sm:text-xl flex-shrink-0">✗</span>
              )}
              <span className="font-semibold text-gray-800 mr-2">
                {option.letter}:
              </span>
              <span className="text-sm sm:text-base text-gray-800">{option.text}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
