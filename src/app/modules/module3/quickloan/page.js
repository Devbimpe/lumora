'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function QuickLoanCase() {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const questions = [
    {
      id: 1,
      question: "Who is most affected by the QuickLoan app's design flaws?",
      options: [
        "Tech-savvy users who can navigate the interface easily",
        "Non-English speakers, older adults, and people in marginalized zip codes",
        "The company's investors and shareholders",
        "Software developers who maintain the app"
      ],
      correctIndex: 1,
    },
    {
      id: 2,
      question: "Which fix best promotes long-term fairness and trust?",
      options: [
        "Add a disclaimer warning that the app may not work for everyone",
        "Lower interest rates slightly to offset discrimination",
        "Redesign from the ground up with diverse user input and bias auditing",
        "Offer a basic phone hotline but keep the app unchanged"
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/modules/module3" className="inline-flex items-center text-pink-700 hover:text-pink-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module 3
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-700 mb-4">
            Case Study: QuickLoan App
          </h1>
          <p className="text-xl text-gray-600">
            Accessibility, inclusion, and hidden bias
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          
          <h2 className="text-2xl font-bold text-pink-700 mb-6">
            The Problem
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <p className="text-gray-800 text-sm mb-2">
                QuickLoan promised "banking for everyone" but created multiple barriers:
              </p>
              <ul className="space-y-1 ml-6 text-sm">
                <li>Only available in English</li>
                <li>Requires smartphone and internet access</li>
                <li>Complex interface difficult for older adults</li>
                <li>Zip code-based loan decisions perpetuate redlining</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-pink-700 mt-6 mb-4">
              Patchwork Fixes vs. Root Causes
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-rose-50 p-4 rounded-lg border-2 border-rose-300">
                <h4 className="font-bold text-rose-800 mb-2 text-sm">❌ Patchwork</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Add Spanish (ignore other languages)</li>
                  <li>• Create "simple mode" (still needs smartphone)</li>
                  <li>• Adjust zip weights (doesn't address bias)</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <h4 className="font-bold text-green-800 mb-2 text-sm">✓ Root Cause</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Co-design with diverse communities</li>
                  <li>• Audit algorithms for bias</li>
                  <li>• Multiple access channels</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Questions */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-pink-700 mb-4">
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
                            ? 'border-gray-300 hover:border-pink-400 bg-white hover:bg-pink-50' 
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
              If you were advising the QuickLoan team, what would you prioritize first and why?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link 
            href="/modules/module3" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Overview
          </Link>
          <Link 
            href="/modules/module3/fitlife" 
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Next: FitLife Case →
          </Link>
        </div>
      </div>
    </div>
  );
}
