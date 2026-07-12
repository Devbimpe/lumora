'use client';

export default function KCTabSwitcher({ tab, onChange }) {
  const tabClass = (active) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
      active
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;

  return (
    <div className="flex border-b border-gray-200 mb-5">
      <button
        onClick={() => onChange('multiple-choice')}
        className={tabClass(tab === 'multiple-choice')}
      >
        Multiple Choice
      </button>
      <button
        onClick={() => onChange('open-ended')}
        className={tabClass(tab === 'open-ended')}
      >
        Open-ended
      </button>
    </div>
  );
}