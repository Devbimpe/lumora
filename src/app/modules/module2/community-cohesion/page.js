'use client';
import Link from 'next/link';

export default function CommunityCohesion() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module2" className="inline-flex items-center text-green-700 hover:text-green-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 2
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            Community & Social Cohesion
          </h1>
          <p className="text-xl text-gray-600">
            Case Study: The SafeStreets App
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            The Scenario
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-green-500 mb-6">
              <p className="text-gray-800 text-sm">
                <strong>SafeStreets</strong> lets residents report "suspicious activity." Instead of building 
                safety, it becomes a tool for racial profiling and community division.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-green-700 mt-6 mb-4">
              Key Issues
            </h3>

            <div className="space-y-3 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-1 text-sm">👁️ Racial Profiling</h4>
                <p className="text-gray-700 text-sm">"Suspicious activity" reflects racial bias without guidance</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-1 text-sm">🔓 Privacy Invasion</h4>
                <p className="text-gray-700 text-sm">Photos and locations shared publicly without consent</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-1 text-sm">💔 Division</h4>
                <p className="text-gray-700 text-sm">Fosters suspicion instead of trust between neighbors</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-1 text-sm">⚖️ No Accountability</h4>
                <p className="text-gray-700 text-sm">False reports have no consequences</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-green-700 mt-6 mb-4">
              Redesign with Dignity
            </h3>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Remove vague "suspicious people" categories</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Prohibit photos of individuals without evidence</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Build in verification and accountability</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Focus on connection, not surveillance</span>
              </li>
            </ul>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mt-6 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-2">💭 Reflection</h3>
            <p className="text-amber-900 text-sm">
              Can safety tech increase harm if built without empathy?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module2/wellbeing-safety" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Well-being & Safety
          </Link>
          <Link 
            href="/modules/module2/systemic-impact" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: Systemic Impact →
          </Link>
        </div>
      </div>
    </div>
  );
}
