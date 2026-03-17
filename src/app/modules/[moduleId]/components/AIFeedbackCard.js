'use client';

import { normalizeGradeFeedback } from '../utils';

export default function AIFeedbackCard({ loading, error, grade, feedback, variant = 'current' }) {
  const { grade: g, feedback: f } = normalizeGradeFeedback(grade, feedback);
  const pillLabel = variant === 'previous' ? 'Previous attempt' : 'Auto-graded';

  return (
    <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-white border border-purple-200 shadow-sm p-4 sm:p-5 mt-0">
      <div className="flex items-start gap-4">
        <div className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24 items-center justify-center">
          {loading ? (
            <div className="flex size-full items-center justify-center rounded-full bg-purple-50">
              <span className="text-base font-semibold text-purple-600">...</span>
            </div>
          ) : error ? (
            <div className="flex size-full items-center justify-center rounded-full bg-purple-50">
              <span className="text-sm font-semibold text-red-600 text-center px-0.5">Error</span>
            </div>
          ) : g != null ? (
            <>
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-purple-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - g / 100)}
                  className="text-purple-500 transition-[stroke-dashoffset] duration-500"
                />
              </svg>
              <span className={`relative font-extrabold text-purple-700 leading-none ${g === 100 ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl'}`}>
                {g}
              </span>
            </>
          ) : (
            <div className="flex size-full items-center justify-center rounded-full bg-purple-50">
              <span className="text-2xl sm:text-4xl font-extrabold text-purple-700 leading-none">—</span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h4 className="mt-0.5 sm:mt-0 font-semibold text-purple-900 text-sm sm:text-base">AI feedback</h4>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-purple-700 whitespace-nowrap">{pillLabel}</span>
          </div>
          {loading ? (
            <p className="text-sm text-purple-700 mt-1">Getting AI feedback...</p>
          ) : error ? (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          ) : (
            <>
              {g != null && <p className="text-sm font-semibold text-purple-900 mt-1">Score: {g}%</p>}
              {f && <p className="text-sm text-purple-900 whitespace-pre-wrap mt-1.5">{f}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
