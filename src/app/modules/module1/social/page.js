'use client';
import Link from 'next/link';

export default function SocialSustainability() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module1" className="inline-flex items-center text-purple-700 hover:text-purple-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 1
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
            Social Sustainability
          </h1>
          <p className="text-xl text-gray-600">
            How technology impacts fairness, inclusion, and well-being
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            The Human Side of Technology
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              Social sustainability focuses on how technology affects real people—their opportunities, 
              dignity, safety, and quality of life.
            </p>

            <h3 className="text-xl font-semibold text-purple-700 mt-6 mb-4">
              Core Principles
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">🤝 Fairness & Equity</h4>
                <p className="text-gray-700 text-sm">
                  Actively ensuring equal access and treatment for all users.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">🌈 Inclusion & Accessibility</h4>
                <p className="text-gray-700 text-sm">
                  Usable by people of all abilities, languages, and backgrounds.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">🧠 Well-being & Mental Health</h4>
                <p className="text-gray-700 text-sm">
                  Respecting users' time and mental health rather than exploiting vulnerabilities.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">🔒 Privacy & Dignity</h4>
                <p className="text-gray-700 text-sm">
                  Protecting user data and giving them meaningful control.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-6">
              <h4 className="font-bold text-blue-900 mb-2">🎯 Connection to Module 2</h4>
              <p className="text-blue-900 text-sm">
                In Module 2, you'll explore social sustainability in depth through four dimensions 
                and real case studies.
              </p>
            </div>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mt-8 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-3">💭 Reflection Question</h3>
            <p className="text-amber-900">
              Why should social outcomes matter as much as technical ones?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module1/economic" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Economic Sustainability
          </Link>
          <Link 
            href="/modules/module2" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue to Module 2 →
          </Link>
        </div>
      </div>
    </div>
  );
}

