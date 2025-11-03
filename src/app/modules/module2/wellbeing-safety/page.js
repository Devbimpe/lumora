'use client';
import Link from 'next/link';

export default function WellbeingSafety() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module2" className="inline-flex items-center text-blue-700 hover:text-blue-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 2
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
            Well-being & Safety
          </h1>
          <p className="text-xl text-gray-600">
            Case Study: The FitLife App
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            The Scenario
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 mb-6">
              <p className="text-gray-800 text-sm">
                <strong>FitLife</strong> gamifies fitness with streaks, leaderboards, and notifications. 
                Usage soars, but so do reports of anxiety, burnout, and obsessive behavior.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-4">
              Key Issues
            </h3>

            <div className="space-y-3 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-1 text-sm">🔄 Addictive Design</h4>
                <p className="text-gray-700 text-sm">Streaks and leaderboards exploit psychological vulnerabilities</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-1 text-sm">😰 Anxiety & Stress</h4>
                <p className="text-gray-700 text-sm">Users feel guilty about breaking streaks or falling behind</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-1 text-sm">🔒 Data Misuse</h4>
                <p className="text-gray-700 text-sm">Activity data sold to advertisers without clear consent</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-1 text-sm">⚠️ Ignoring Rest</h4>
                <p className="text-gray-700 text-sm">Rewards continuous activity, penalizes rest days</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-4">
              Responsible Design
            </h3>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Celebrate rest days as essential to health</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Replace competition with supportive communities</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Limit notifications and respect users' time</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Protect data and give users full control</span>
              </li>
            </ul>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mt-6 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-2">💭 Reflection</h3>
            <p className="text-amber-900 text-sm">
              How can gamification be ethical instead of addictive?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module2/equity-inclusion" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Equity & Inclusion
          </Link>
          <Link 
            href="/modules/module2/community-cohesion" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: Community & Cohesion →
          </Link>
        </div>
      </div>
    </div>
  );
}
