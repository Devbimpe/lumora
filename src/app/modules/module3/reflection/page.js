'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function PersonalReflection() {
  const [reflections, setReflections] = useState({
    principle: '',
    futureProjects: '',
  });

  const handleChange = (field, value) => {
    setReflections(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module3" className="inline-flex items-center text-purple-700 hover:text-purple-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 3
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
            Personal Reflection
          </h1>
          <p className="text-xl text-gray-600">
            Connecting learning to your work
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            Key Takeaways
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">

            <div className="space-y-3 mb-8">
              <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                <span className="text-blue-600 mr-2 mt-1 text-sm font-bold">1</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Technology is Never Neutral</p>
                  <p className="text-xs text-gray-700">Every design choice sends a message about what values matter</p>
                </div>
              </div>

              <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                <span className="text-blue-600 mr-2 mt-1 text-sm font-bold">2</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Scale Amplifies Impact</p>
                  <p className="text-xs text-gray-700">Small biases become systemic discrimination</p>
                </div>
              </div>

              <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                <span className="text-blue-600 mr-2 mt-1 text-sm font-bold">3</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Design for the Margins</p>
                  <p className="text-xs text-gray-700">Building with the vulnerable in mind creates better systems</p>
                </div>
              </div>

              <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                <span className="text-blue-600 mr-2 mt-1 text-sm font-bold">4</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Developers Have Responsibility</p>
                  <p className="text-xs text-gray-700">You shape the future through the systems you build</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection Prompts */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-purple-700 mb-4">
              Your Reflections
            </h3>

            <p className="text-gray-700 mb-6 text-sm">
              Take time to write or discuss your thoughts on these questions.
            </p>

            <div className="space-y-6">
              {/* Question 1 */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                <h4 className="font-bold text-amber-900 mb-3 text-sm">
                  💭 Question 1
                </h4>
                <p className="text-amber-900 mb-3 text-sm">
                  Which principle of social sustainability challenges your current thinking the most? Why?
                </p>
                <textarea
                  value={reflections.principle}
                  onChange={(e) => handleChange('principle', e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="w-full h-24 p-3 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none resize-none text-sm"
                />
              </div>

              {/* Question 2 */}
              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-5 rounded-r-lg">
                <h4 className="font-bold text-indigo-900 mb-3 text-sm">
                  🔮 Question 2
                </h4>
                <p className="text-indigo-900 mb-3 text-sm">
                  How could your future projects embed fairness and care by design?
                </p>
                <textarea
                  value={reflections.futureProjects}
                  onChange={(e) => handleChange('futureProjects', e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="w-full h-24 p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-400 focus:outline-none resize-none text-sm"
                />
              </div>
            </div>

            {/* Additional Discussion Topics */}
            <div className="mt-8 bg-green-50 p-5 rounded-lg border-2 border-green-200">
              <h4 className="font-bold text-green-800 mb-3 text-sm">🗣️ Group Discussion Topics</h4>
              <ul className="space-y-1 text-gray-700 ml-4 text-xs">
                <li>• What surprised you most in these modules?</li>
                <li>• Which case study resonated with you personally?</li>
                <li>• How do you balance business pressures with ethical concerns?</li>
                <li>• What would need to change in tech culture to make ethical design the default?</li>
              </ul>
            </div>
          </div>

          {/* Closing Message */}
          <div className="mt-8 text-center bg-gradient-to-r from-green-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              You Are Building the Future
            </h3>
            <p className="text-gray-700 text-sm">
              Every design choice contributes to the world we'll all inhabit. Build technology 
              that you'd be proud to explain to future generations.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module3/safestreets" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← SafeStreets Case
          </Link>
          <Link 
            href="/training-module" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Complete Training →
          </Link>
        </div>
      </div>
    </div>
  );
}
