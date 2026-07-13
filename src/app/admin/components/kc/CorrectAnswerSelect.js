'use client';

export default function CorrectAnswerSelect({ choices, value, onChange }) {
  // value is the index as a string ('' = none); pass empty string to reset.
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
      >
        <option value="">Select correct answer</option>
        {choices.reduce((opts, choice, idx) => {
          if (choice.trim()) {
            const letter = String.fromCharCode(65 + opts.length);
            opts.push(
              <option key={letter} value={String(opts.length)}>
                {letter}
              </option>,
            );
          }
          return opts;
        }, [])}
      </select>
    </div>
  );
}