'use client';

export default function ChoicesEditor({ choices, onChange, onRemove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
      {choices.map((choice, idx) => {
        const letter = String.fromCharCode(65 + idx);
        return (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 w-6">{letter}:</span>
            <input
              type="text"
              placeholder={`Choice ${letter}`}
              value={choice}
              onChange={(e) => {
                const updated = [...choices];
                updated[idx] = e.target.value;
                onChange(updated);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {choices.length > 2 && (
              <button
                onClick={() => onRemove(idx)}
                className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                aria-label={`Remove choice ${letter}`}
              >
                X
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={() => onChange([...choices, ''])}
        className="mt-1 text-sm text-green-600 hover:text-green-800 font-medium"
      >
        + Add Choice
      </button>
    </div>
  );
}