'use client';

export function QuestionInput({ value, onChange, placeholder = 'Enter the question' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows="3"
      />
    </div>
  );
}

export function SampleAnswerInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Sample Answer</label>
      <textarea
        placeholder="Enter a sample or expected answer for grading reference"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows="5"
      />
    </div>
  );
}

export function ExplanationInput({ type, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (optional)</label>
      <textarea
        placeholder={
          type === 'open-ended'
            ? 'Add any additional notes or context for grading'
            : 'Explain why the correct answer is right'
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows="3"
      />
    </div>
  );
}