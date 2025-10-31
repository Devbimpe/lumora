'use client';
import Link from 'next/link';

export default function SystemicImpact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module2" className="inline-flex items-center text-purple-700 hover:text-purple-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 2
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
            Long-term & Systemic Impact
          </h1>
          <p className="text-xl text-gray-600">
            Designing for ripple effects across generations
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            Thinking Beyond Tomorrow
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6 text-sm">
              The most significant impacts of technology unfold over time—rippling through communities 
              and affecting future generations.
            </p>

            <h3 className="text-xl font-semibold text-purple-700 mt-6 mb-4">
              Understanding Ripple Effects
            </h3>

            <div className="space-y-3 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-1 text-sm">🌊 Amplification</h4>
                <p className="text-gray-700 text-sm">Small biases become systemic discrimination at scale over time</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-1 text-sm">🔗 Interconnected Systems</h4>
                <p className="text-gray-700 text-sm">Changes in one area cascade into others</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-1 text-sm">👶 Intergenerational Impact</h4>
                <p className="text-gray-700 text-sm">Today's technology shapes the world children inherit</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-1 text-sm">⚙️ Path Dependencies</h4>
                <p className="text-gray-700 text-sm">Early decisions constrain future options</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-purple-700 mt-6 mb-4">
              Designing for the Long Term
            </h3>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Ask "What if this scales?" across millions of users over years</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Build flexibility for adaptation as values evolve</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Question historical data for embedded biases</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Consider second-order effects and behaviors encouraged</span>
              </li>
            </ul>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mt-6 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-2">💭 Reflection</h3>
            <p className="text-amber-900 text-sm">
              How could your code still impact people ten years from now?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module2/community-cohesion" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Community & Cohesion
          </Link>
          <Link 
            href="/modules/module3" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue to Module 3 →
          </Link>
        </div>
      </div>
    </div>
  );
}
