'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function SafeStreetsCase() {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const questions = [
    {
      id: 1,
      question: "How do features like 'suspicious person reporting' enable or prevent harm?",
      options: [
        "They enable harm by facilitating racial profiling and privacy violations",
        "They prevent harm by keeping communities safe from crime",
        "They're neutral—harm depends entirely on user behavior",
        "They enable harm but it's worth it for safety benefits"
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      question: "What responsibility does the developer have when their product is misused?",
      options: [
        "None—users are responsible for how they use technology",
        "Minimal—add a terms of service warning about misuse",
        "Significant—anticipate misuse and design to prevent it",
        "Limited—only fix issues after patterns of harm are proven"
      ],
      correctIndex: 2,
    },
  ];

  const handleAnswer = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module3" className="inline-flex items-center text-green-700 hover:text-green-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 3
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            Case Study: SafeStreets App
          </h1>
          <p className="text-xl text-gray-600">
            Racial bias, privacy, and surveillance
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            The Problem
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <p className="text-gray-800 text-sm mb-2">
                SafeStreets lets neighbors report "suspicious activity" but becomes a tool for harm:
              </p>
              <ul className="space-y-1 ml-6 text-sm">
                <li>Vague reporting leads to racial profiling</li>
                <li>Photos shared publicly without consent</li>
                <li>No accountability for false reports</li>
                <li>Trust between neighbors erodes</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-green-700 mt-6 mb-4">
              Design Choices Matter
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-rose-50 p-4 rounded-lg border-2 border-rose-300">
                <h4 className="font-bold text-rose-800 mb-2 text-sm">What Design Enabled</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>✓ Easy to report "suspicious people"</li>
                  <li>✓ Easy to attach photos</li>
                  <li>✓ Easy to make vague claims</li>
                  <li>✓ Easy to remain anonymous</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                <h4 className="font-bold text-amber-800 mb-2 text-sm">What Design Made Difficult</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>✗ Hard to verify claims</li>
                  <li>✗ Hard to appeal false reports</li>
                  <li>✗ Hard to hold users accountable</li>
                  <li>✗ Hard to build trust</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-green-700 mt-6 mb-4">
              Better Approach
            </h3>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Remove vague "suspicious people" categories</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1 text-sm">✓</span>
                <span className="text-sm">Prohibit photos without evidence of wrongdoing</span>
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

          {/* Interactive Questions */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-green-700 mb-4">
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
                            ? 'border-gray-300 hover:border-green-400 bg-white hover:bg-green-50' 
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
              Who decides what "safety" means, and whose safety gets prioritized?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module3/fitlife" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← FitLife Case
          </Link>
          <Link 
            href="/modules/module3/reflection" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: Personal Reflection →
          </Link>
        </div>
      </div>
    </div>
  );
}
