'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function FitLifeCase() {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const questions = [
    {
      id: 1,
      question: "Should a company profit from features that cause harm to users' mental health?",
      options: [
        "Yes, users choose to use the app voluntarily",
        "No, companies have an ethical responsibility to prioritize user well-being",
        "It depends on whether users are warned about potential risks",
        "It's acceptable as long as the app also provides some benefits"
      ],
      correctIndex: 1,
    },
    {
      id: 2,
      question: "What does responsible product design look like?",
      options: [
        "Maximum engagement and daily active users",
        "Features that respect users' mental health and encourage sustainable habits",
        "Competitive leaderboards to motivate users",
        "As many notifications as possible to keep users coming back"
      ],
      correctIndex: 1,
    },
  ];

  const handleAnswer = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module3" className="inline-flex items-center text-blue-700 hover:text-blue-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 3
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
            Case Study: FitLife App
          </h1>
          <p className="text-xl text-gray-600">
            The tension between engagement and well-being
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            The Problem
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <p className="text-gray-800 text-sm mb-2">
                FitLife gamifies fitness but creates harm:
              </p>
              <ul className="space-y-1 ml-6 text-sm">
                <li>Streaks and leaderboards trigger anxiety</li>
                <li>Users feel guilty for missing days</li>
                <li>Some exercise despite injury</li>
                <li>Health data sold to advertisers</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-4">
              The Engagement Trap
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-rose-50 p-4 rounded-lg border-2 border-rose-300">
                <h4 className="font-bold text-rose-800 mb-2 text-sm">📈 Business Metrics</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Daily active users: High ✓</li>
                  <li>• Retention: 85% ✓</li>
                  <li>• Data monetization: Growing ✓</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                <h4 className="font-bold text-amber-800 mb-2 text-sm">🧠 User Well-being</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Anxiety: Increasing ✗</li>
                  <li>• Stress about streaks: Common ✗</li>
                  <li>• Exercising when injured: Reported ✗</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-4">
              Responsible Design
            </h3>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Celebrate rest days as part of fitness</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Replace leaderboards with supportive groups</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Limit notifications and respect users' time</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Never sell user data</span>
              </li>
            </ul>
          </div>

          {/* Interactive Questions */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-blue-700 mb-4">
              Reflection Questions
            </h3>

            {questions.map((q) => (
              <div key={q.id} className="mb-6 bg-gray-50 p-5 rounded-lg">
                <p className="font-semibold text-gray-800 mb-3 text-sm">{q.id}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, index) => {
                    const isSelected = selectedAnswers[q.id] === index;
                    const isCorrect = index === q.correctIndex;
                    const showFeedback = selectedAnswers[q.id] !== undefined;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(q.id, index)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                          !showFeedback 
                            ? 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50' 
                            : isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isSelected
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-300 bg-white opacity-60'
                        }`}
                      >
                        <div className="flex items-start">
                          {showFeedback && isCorrect && (
                            <span className="text-green-600 mr-2">✓</span>
                          )}
                          {showFeedback && isSelected && !isCorrect && (
                            <span className="text-rose-600 mr-2">✗</span>
                          )}
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Discussion Prompt */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mt-6 rounded-r-lg">
            <h3 className="text-base font-bold text-amber-900 mb-2">💭 Group Discussion</h3>
            <p className="text-amber-900 text-sm">
              As a developer, how would you respond if asked to implement features you believed were harmful?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module3/quickloan" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← QuickLoan Case
          </Link>
          <Link 
            href="/modules/module3/safestreets" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: SafeStreets Case →
          </Link>
        </div>
      </div>
    </div>
  );
}
