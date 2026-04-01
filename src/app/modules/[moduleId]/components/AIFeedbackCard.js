'use client';

import { useEffect, useState } from 'react';
import { normalizeGradeFeedback } from '../utils';

const CIRCLE_R = 42;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;
const GRADE_DURATION_MS = 950;

// First 45% of time: 0 → 70%. Last 55% of time: 70% → 100% with strong ease-out so the count visibly slows (95→100).
function easeCountWithSlowEnd(t) {
  if (t <= 0.45) {
    return (t / 0.45) * 0.7;
  }
  const u = (t - 0.45) / 0.55; // 0..1 over the last 55% of duration
  return 0.7 + 0.3 * (1 - (1 - u) ** 5); // strong ease-out for the last 30% of value
}

export default function AIFeedbackCard({ loading, error, grade, feedback, variant = 'current' }) {
  const { grade: g, feedback: f } = normalizeGradeFeedback(grade, feedback);
  const pillLabel = variant === 'previous' ? 'Previous attempt' : 'Auto-graded';
  const [displayGrade, setDisplayGrade] = useState(0);

  useEffect(() => {
    if (g == null) {
      setDisplayGrade(0);
      return;
    }
    const start = performance.now();
    let rafId;
    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / GRADE_DURATION_MS, 1);
      setDisplayGrade(easeCountWithSlowEnd(t) * g);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [g]);

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
                  r={CIRCLE_R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - displayGrade / 100)}
                  className="text-purple-500"
                />
              </svg>
              <span className={`relative font-extrabold text-purple-700 leading-none ${g === 100 ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl'}`}>
                {Math.round(displayGrade)}
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
