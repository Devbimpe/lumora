'use client';
import Link from 'next/link';

export default function Module2Intro() {
  const dimensions = [
    {
      title: 'Equity & Inclusion',
      description: 'The QuickLoan App scenario - addressing bias and access',
      href: '/modules/module2/equity-inclusion',
      bgColor: 'bg-pink-50',
      icon: '🤝',
    },
    {
      title: 'Well-being & Safety',
      description: 'The FitLife App scenario - balancing engagement and health',
      href: '/modules/module2/wellbeing-safety',
      bgColor: 'bg-blue-50',
      icon: '🧠',
    },
    {
      title: 'Community & Social Cohesion',
      description: 'The SafeStreets App scenario - preventing harm',
      href: '/modules/module2/community-cohesion',
      bgColor: 'bg-green-50',
      icon: '🏘️',
    },
    {
      title: 'Long-term & Systemic Impact',
      description: 'Understanding ripple effects across generations',
      href: '/modules/module2/systemic-impact',
      bgColor: 'bg-purple-50',
      icon: '♾️',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/training-module" className="inline-flex items-center text-orange-700 hover:text-orange-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-700 mb-4">
            MODULE 2: Dimensions of Social Sustainability
          </h1>
          <p className="text-xl text-gray-600">
            How technology shapes fairness, well-being, and community
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-orange-700 mb-6">
            Four Pillars of Social Sustainability
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              In Module 1, we introduced social sustainability as one of three core dimensions. Now, 
              we'll explore it in depth by examining four key pillars that shape how technology affects 
              real users and societies.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-pink-50 p-5 rounded-lg border-2 border-pink-200">
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="text-lg font-bold text-pink-800 mb-2">1. Equity & Inclusion</h3>
                <p className="text-gray-700 text-sm">
                  Ensuring technology is accessible, unbiased, and serves diverse populations fairly. 
                  Who benefits? Who gets left behind?
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="text-lg font-bold text-blue-800 mb-2">2. Well-being & Safety</h3>
                <p className="text-gray-700 text-sm">
                  Protecting users' mental, physical, and emotional health. Does technology enhance 
                  or exploit human vulnerabilities?
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                <div className="text-3xl mb-2">🏘️</div>
                <h3 className="text-lg font-bold text-green-800 mb-2">3. Community & Social Cohesion</h3>
                <p className="text-gray-700 text-sm">
                  Building connections that strengthen communities rather than divide them. Does 
                  technology bring people together or push them apart?
                </p>
              </div>

              <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
                <div className="text-3xl mb-2">♾️</div>
                <h3 className="text-lg font-bold text-purple-800 mb-2">4. Long-term & Systemic Impact</h3>
                <p className="text-gray-700 text-sm">
                  Considering ripple effects and intergenerational consequences. How will today's 
                  code affect people years from now?
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-orange-700 mt-8 mb-4">
              Why These Dimensions Matter
            </h3>

            <p className="mb-4">
              These four pillars help us ask the right questions when designing and building technology:
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-orange-600 mr-3 mt-1">•</span>
                <span>They reveal hidden biases and unintended consequences</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-3 mt-1">•</span>
                <span>They shift focus from "what's technically possible" to "what's ethically right"</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-3 mt-1">•</span>
                <span>They provide a framework for evaluating real-world impact</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-3 mt-1">•</span>
                <span>They guide us toward more inclusive, responsible design choices</span>
              </li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8 rounded-r-lg">
              <h4 className="font-bold text-blue-900 mb-3">💡 Learning Approach</h4>
              <p className="text-blue-900">
                Each dimension is explored through a realistic app scenario. You'll see how design 
                decisions create real-world consequences, and you'll evaluate different approaches 
                to addressing the problems that emerge.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation to Dimensions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-orange-700 text-center mb-6">
            Explore Each Dimension
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {dimensions.map((dimension, index) => (
              <Link 
                key={index} 
                href={dimension.href}
                className={`${dimension.bgColor} p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-orange-500`}
              >
                <div className="text-4xl mb-3">{dimension.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{dimension.title}</h3>
                <p className="text-gray-600 mb-3">{dimension.description}</p>
                <span className="text-orange-600 font-semibold inline-flex items-center">
                  Explore scenario
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

