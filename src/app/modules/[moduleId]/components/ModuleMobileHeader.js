'use client';

export default function ModuleMobileHeader({ title, onMenuClick }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40 px-4 py-3">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-black hover:text-green-700 transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-black truncate">{title}</h2>
      </div>
    </div>
  );
}
