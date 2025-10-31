'use client';
import Link from 'next/link';

export default function EnvironmentalSustainability() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module1" className="inline-flex items-center text-green-700 hover:text-green-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 1
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            Environmental Sustainability
          </h1>
          <p className="text-xl text-gray-600">
            How technology contributes to environmental change
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            How Technology Impacts the Environment
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            
            <h3 className="text-xl font-semibold text-green-700 mt-6 mb-4">
              Key Environmental Challenges
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">⚡ Data Center Energy</h4>
                <p className="text-gray-700 text-sm">
                  Data centers consume 1-2% of global electricity, running 24/7 with massive cooling needs, 
                  contributing significantly to carbon emissions.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">📱 Device Energy Use</h4>
                <p className="text-gray-700 text-sm">
                  Inefficient software drains batteries faster, multiplied by billions of devices worldwide.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">🗑️ E-Waste</h4>
                <p className="text-gray-700 text-sm">
                  Planned obsolescence and rapid hardware cycles generate millions of tons of toxic e-waste annually.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-green-700 mt-6 mb-4">
              Sustainable Solutions
            </h3>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">✓</span>
                <span><strong>Energy-Efficient Code:</strong> Optimize algorithms to use fewer resources</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">✓</span>
                <span><strong>Green Cloud Computing:</strong> Choose providers that use renewable energy</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">✓</span>
                <span><strong>Sustainable Design:</strong> Support older hardware and extend device lifespan</span>
              </li>
            </ul>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mt-8 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-3">💭 Reflection Question</h3>
            <p className="text-amber-900">
              How can software be written or deployed in a way that reduces environmental impact?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module1" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Overview
          </Link>
          <Link 
            href="/modules/module1/economic" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: Economic Sustainability →
          </Link>
        </div>
      </div>
    </div>
  );
}

