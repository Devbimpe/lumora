'use client';
import Link from 'next/link';

export default function EconomicSustainability() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module1" className="inline-flex items-center text-blue-700 hover:text-blue-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 1
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
            Economic Sustainability
          </h1>
          <p className="text-xl text-gray-600">
            Maintaining long-term financial and operational viability
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Economic Sustainability in Tech
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              Building systems that remain financially viable over time while maintaining ethical practices.
            </p>

            <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-4">
              Key Principles
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">💼 Cost-Effective Infrastructure</h4>
                <p className="text-gray-700 text-sm">
                  Choose appropriate tech stacks and plan for long-term operational costs.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">⚖️ Fair Labor Practices</h4>
                <p className="text-gray-700 text-sm">
                  Fair wages, reasonable hours, and equitable compensation for all workers.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">🔗 Ethical Sourcing</h4>
                <p className="text-gray-700 text-sm">
                  Transparent supply chains and ethically sourced materials.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-4">
              Balancing Profit and Sustainability
            </h3>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">•</span>
                <span>Investors may push for rapid growth over sustainable practices</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">•</span>
                <span>Cost-cutting can compromise quality and ethical standards</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">•</span>
                <span>Short-term wins may harm long-term viability</span>
              </li>
            </ul>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mt-8 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-3">💭 Reflection Question</h3>
            <p className="text-amber-900">
              How do profit motives sometimes conflict with sustainability goals?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module1/environmental" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Environmental Sustainability
          </Link>
          <Link 
            href="/modules/module1/social" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: Social Sustainability →
          </Link>
        </div>
      </div>
    </div>
  );
}

