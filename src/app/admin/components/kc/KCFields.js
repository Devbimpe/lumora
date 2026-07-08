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

export function RubricInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Grading rubric
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Level descriptors the grader scores against, e.g. &quot;3 = ... 2 = ... 1 = ... 0 = ...&quot;.
      </p>
      <textarea
        placeholder="Enter the rubric with level descriptors (e.g. 3 = ... 0 = ...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows="5"
      />
    </div>
  );
}

export function GradingContextInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Grading context (optional)
      </label>
      <p className="text-xs text-gray-500 mb-2">
        The scenario shown to the participant. Passed to the grader as ground truth so it can judge
        claims that reference it. Leave empty for scenario-less reflection questions.
      </p>
      <textarea
        placeholder="Paste the scenario the participant saw (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows="4"
      />
    </div>
  );
}

export function ExplanationInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (optional)</label>
      <p className="text-xs text-gray-500 mb-2">
        Shown to students after they answer, to explain why the correct answer is right.
      </p>
      <textarea
        placeholder="Explain why the correct answer is right"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows="3"
      />
    </div>
  );
}