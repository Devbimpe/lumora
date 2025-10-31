'use client';
import Link from 'next/link';

export default function Module1Intro() {
  const dimensions = [
    {
      title: 'Environmental Sustainability',
      description: 'How technology impacts our planet',
      href: '/modules/module1/environmental',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Economic Sustainability',
      description: 'Long-term viability and ethical operations',
      href: '/modules/module1/economic',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Social Sustainability',
      description: 'Fairness, inclusion, and well-being',
      href: '/modules/module1/social',
      bgColor: 'bg-purple-50',
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
            MODULE 1: Sustainability & Its Dimensions
          </h1>
          <p className="text-xl text-gray-600">
            Understanding what sustainability means in the tech industry
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-green-700 mb-6">What is Sustainability?</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Sustainability in software engineering means creating technology that meets today's needs 
              without compromising the ability of future generations to meet their own needs.
            </p>

            <h3 className="text-xl font-semibold text-green-700 mt-8 mb-4">
              Why Sustainability Matters in Software Engineering
            </h3>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">•</span>
                <span><strong>Environmental Impact:</strong> Data centers consume massive amounts of energy, and e-waste is growing exponentially</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">•</span>
                <span><strong>Economic Responsibility:</strong> Sustainable practices ensure long-term viability and fair operations</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">•</span>
                <span><strong>Social Justice:</strong> Technology affects real people—their privacy, opportunities, and well-being</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-green-700 mt-8 mb-4">
              The Three Core Dimensions
            </h3>
            
            <p className="mb-6">
              Sustainability rests on three interconnected pillars. Each dimension influences the others, 
              and true sustainability requires balancing all three:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-700 mb-2">🌍 Environmental</h4>
                <p className="text-sm">Minimizing ecological footprint and protecting natural resources</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-700 mb-2">💰 Economic</h4>
                <p className="text-sm">Maintaining long-term financial viability and ethical operations</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-700 mb-2">👥 Social</h4>
                <p className="text-sm">Ensuring fairness, inclusion, and community well-being</p>
              </div>
            </div>
          </div>

          {/* Reflection Question */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mt-8 rounded-r-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-3">💭 Reflection Question</h3>
            <p className="text-amber-900">
              In your opinion, which of these three areas do software developers impact most, and why? 
              Think about your own experiences and the apps you use daily.
            </p>
          </div>
        </div>

        {/* Navigation to Dimensions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
            Explore Each Dimension
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {dimensions.map((dimension, index) => (
              <Link 
                key={index} 
                href={dimension.href}
                className={`${dimension.bgColor} p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-500`}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{dimension.title}</h3>
                <p className="text-gray-600 mb-3">{dimension.description}</p>
                <span className="text-green-600 font-semibold inline-flex items-center">
                  Learn more
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

