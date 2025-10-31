'use client';
import Link from 'next/link';

export default function Module3Intro() {
  const caseStudies = [
    {
      title: 'QuickLoan App',
      description: 'Examining accessibility, inclusion, and financial discrimination',
      href: '/modules/module3/quickloan',
      bgColor: 'bg-pink-50',
      icon: '💳',
    },
    {
      title: 'FitLife App',
      description: 'Exploring the balance between engagement and user well-being',
      href: '/modules/module3/fitlife',
      bgColor: 'bg-blue-50',
      icon: '🏃',
    },
    {
      title: 'SafeStreets App',
      description: 'Understanding racial bias, privacy, and community impact',
      href: '/modules/module3/safestreets',
      bgColor: 'bg-green-50',
      icon: '🏘️',
    },
    {
      title: 'Personal Reflection',
      description: 'Apply what you\'ve learned to your own work',
      href: '/modules/module3/reflection',
      bgColor: 'bg-purple-50',
      icon: '💭',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/training-module" className="inline-flex items-center text-green-700 hover:text-green-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            MODULE 3: Case Scenarios & Reflective Exercises
          </h1>
          <p className="text-xl text-gray-600">
            Apply your learning through realistic case studies
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            Putting Theory into Practice
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              You've learned about sustainability's three core dimensions (environmental, economic, 
              social) and explored the four pillars of social sustainability. Now it's time to apply 
              that knowledge through realistic scenarios.
            </p>

            <h3 className="text-xl font-semibold text-green-700 mt-8 mb-4">
              What You'll Do in This Module
            </h3>

            <div className="space-y-4 mb-8">
              <div className="bg-green-50 p-5 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">🔍 Analyze Real-World Cases</h4>
                <p className="text-gray-700">
                  Revisit the three app scenarios from Module 2 with a deeper, more critical lens. 
                  Identify root causes, evaluate solutions, and consider tradeoffs.
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">💬 Engage with Reflection Questions</h4>
                <p className="text-gray-700">
                  Each case study includes questions designed to spark discussion and critical thinking. 
                  There are often no "perfect" answers—the goal is to think deeply about competing values.
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">🤔 Connect to Your Own Work</h4>
                <p className="text-gray-700">
                  The Personal Reflection section invites you to consider how these principles apply 
                  to projects you're working on or plan to work on in the future.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-green-700 mt-8 mb-4">
              How to Approach These Case Studies
            </h3>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">1.</span>
                <span><strong>Look for root causes, not just symptoms:</strong> Ask "Why did this happen?" multiple times to uncover deeper issues</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">2.</span>
                <span><strong>Consider multiple perspectives:</strong> Who benefits from the current design? Who is harmed? Whose voices are missing?</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">3.</span>
                <span><strong>Evaluate tradeoffs honestly:</strong> Every solution involves choices. What values are you prioritizing, and what are you giving up?</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">4.</span>
                <span><strong>Discuss with others:</strong> These scenarios work best as group exercises. Different viewpoints reveal blind spots</span>
              </li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8 rounded-r-lg">
              <h4 className="font-bold text-blue-900 mb-3">💡 Remember</h4>
              <p className="text-blue-900">
                The goal isn't to find the "right answer." It's to develop the habit of asking ethical 
                questions throughout the development process. Responsible tech starts with recognizing 
                that every design choice has human consequences.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation to Case Studies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
            Explore Case Studies
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {caseStudies.map((study, index) => (
              <Link 
                key={index} 
                href={study.href}
                className={`${study.bgColor} p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-500`}
              >
                <div className="text-4xl mb-3">{study.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{study.title}</h3>
                <p className="text-gray-600 mb-3">{study.description}</p>
                <span className="text-green-600 font-semibold inline-flex items-center">
                  Analyze case
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

