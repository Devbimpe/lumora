'use client';
import { useId } from 'react';

export default function AIGradingToggle({ enabled, onChange }) {
  const toggleId = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={toggleId} className="relative inline-flex! items-center cursor-pointer m-0! gap-2">
        <input
          id={toggleId}
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all" />
        <span className="text-sm font-medium text-gray-700 select-none">
          AI grading
        </span>
      </label>
    </div>
  );
}
