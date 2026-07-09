"use client"

import { useState } from "react"

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const faqs = [
    {
      question: "What is LUMORA?",
      answer: "LUMORA is a scenario-based learning platform that helps learners explore the social, ethical, and human dimensions of software engineering through interactive dilemmas and reflective decision-making exercises."
    },
    {
      question: "Why is LUMORA needed?",
      answer: "Modern software influences healthcare, banking, education, accessibility, and everyday life. Yet many systems unintentionally reinforce bias, exclude users, or compromise privacy. LUMORA helps developers recognize these issues and make socially responsible design choices."
    },
    {
      question: "What makes LUMORA different from traditional learning?",
      answer: "Instead of lectures, LUMORA uses immersive scenarios where you make decisions, justify your reasoning, and reflect on real-world consequences."
    },
    {
      question: "What is LUMORA's learning approach?",
      answer: "LUMORA follows a Learn → Reflect → Apply model: Learn: Short interactive modules. Reflect: Choose actions and view consequences. Apply: Bring insights into real software development contexts."
    },
    {
      question: "What topics does LUMORA cover?",
      answer: "You will explore: Social sustainability in software, Equity, accessibility, and user well-being, Community engagement and user representation, Algorithmic bias, surveillance issues, and inclusive design trade-offs."
    },
    {
      question: "Are the scenarios based on real situations?",
      answer: "Yes. Scenarios are inspired by real industry cases, research, and ethical challenges faced by software teams."
    },
    {
      question: "How long does each scenario take?",
      answer: "Most scenarios take 10–20 minutes, depending on the depth of reflection."
    },
    {
      question: "Can I replay scenarios?",
      answer: "Yes. You can revisit any scenario to explore different paths and outcomes."
    },
    {
      question: "Who can use LUMORA? ",
      answer: "Students, developers, UX designers, and anyone interested in ethical and socially aware technology."
    },
    {
      question: "Do I need any background knowledge?",
      answer: "No. All modules are beginner-friendly and approachable for learners at any level."
    },
    {
      question: "Does LUMORA track my progress?",
      answer: "Yes. LUMORA automatically tracks your completed modules, in-progress modules, and not-started modules."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          Frequently asked questions
        </h2>

        <div className="space-y-3">
          {(showAll ? faqs : faqs.slice(0, 5)).map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-colors duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between group transition-colors duration-200"
              >
                <span className="text-base font-medium text-gray-900 group-hover:text-green-700 pr-8">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-green-700 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-green-700 font-medium hover:text-green-800 transition-colors duration-200"
          >
            <span>{showAll ? "Show Less" : "See more FAQs"}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}