'use client';
import Link from 'next/link';

export default function EquityInclusion() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module2" className="inline-flex items-center text-pink-700 hover:text-pink-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 2
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-700 mb-4">
            Equity & Inclusion
          </h1>
          <p className="text-xl text-gray-600">
            Case Study: The QuickLoan App
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-pink-700 mb-6">
            The Scenario
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-pink-500 mb-6">
              <p className="text-gray-800 text-sm">
                <strong>QuickLoan</strong> promises "banking for everyone" but creates barriers: 
                only in English, requires smartphones, denies loans based on zip codes, difficult 
                interface for older adults.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-pink-700 mt-6 mb-4">
              Key Issues
            </h3>

            <div className="space-y-3 mb-6">
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-bold text-pink-800 mb-1 text-sm">🗣️ Language Bias</h4>
                <p className="text-gray-700 text-sm">English-only excludes millions of users</p>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-bold text-pink-800 mb-1 text-sm">📱 Digital Access</h4>
                <p className="text-gray-700 text-sm">Requires smartphone and internet connection</p>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-bold text-pink-800 mb-1 text-sm">🏘️ Discrimination</h4>
                <p className="text-gray-700 text-sm">Zip code-based decisions perpetuate redlining</p>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-bold text-pink-800 mb-1 text-sm">👵 Accessibility</h4>
                <p className="text-gray-700 text-sm">Complex interface excludes older adults</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-pink-700 mt-6 mb-4">
              The Solution
            </h3>

            <p className="mb-4 text-sm">Co-design for true inclusion from the start:</p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-pink-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Include diverse users in the design process</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Audit algorithms for bias across demographics</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Provide multiple access points (phone, physical locations)</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Follow accessibility standards and multi-language support</span>
              </li>
            </ul>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mt-6 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-2">💭 Reflection</h3>
            <p className="text-amber-900 text-sm">
              Who gets left out when we design for the "average" user?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module2" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Overview
          </Link>
          <Link 
            href="/modules/module2/wellbeing-safety" 
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: Well-being & Safety →
          </Link>
        </div>
      </div>
    </div>
  );
}
