'use client';

export function KCTextField({ label, helper, placeholder, rows, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {helper && <p className="text-xs text-gray-500 mb-2">{helper}</p>}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows={rows}
      />
    </div>
  );
}

export function QuestionInput({ value, onChange }) {
  return (
    <KCTextField
      label="Question"
      placeholder="Enter the question"
      rows="3"
      value={value}
      onChange={onChange}
    />
  );
}

export function RubricInput({ value, onChange }) {
  return (
    <KCTextField
      label="Grading rubric"
      helper="Level descriptors the grader scores against, e.g. &quot;3 = ... 2 = ... 1 = ... 0 = ...&quot;."
      placeholder="Enter the rubric with level descriptors (e.g. 3 = ... 0 = ...)"
      rows="5"
      value={value}
      onChange={onChange}
    />
  );
}

export function GradingContextInput({ value, onChange }) {
  return (
    <KCTextField
      label="Grading context (optional)"
      helper="The scenario shown to the participant. Passed to the grader as ground truth so it can judge claims that reference it. Leave empty for scenario-less reflection questions."
      placeholder="Paste the scenario the participant saw (optional)"
      rows="4"
      value={value}
      onChange={onChange}
    />
  );
}

export function ExplanationInput({ value, onChange }) {
  return (
    <KCTextField
      label="Explanation (optional)"
      helper="Shown to students after they answer, to explain why the correct answer is right."
      placeholder="Explain why the correct answer is right"
      rows="3"
      value={value}
      onChange={onChange}
    />
  );
}

export function OpenEndedExplanationInput({ value, onChange }) {
  return (
    <KCTextField
      label="Explanation (required)"
      helper="Shown to students after they submit."
      placeholder="Provide a model answer or key takeaway for students to review after submitting"
      rows="4"
      value={value}
      onChange={onChange}
    />
  );
}
